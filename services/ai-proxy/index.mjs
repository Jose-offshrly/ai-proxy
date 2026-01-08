// Scout AI Proxy - Lambda with Response Streaming
// Handles Text Agent (SSE proxy) and Voice Agent (session creation)
// CORS is handled by Function URL config, not in code
//
// Supports two modes:
// 1. Pass-through mode: Client sends full OpenAI request (legacy/BYOK)
// 2. Obfuscated mode: Client sends session_type, Lambda adds prompts/tools (secure)
//
// Security: JWT validation via Auth0 JWKS (Phase 6)

import { getTools } from './tools.mjs';
import { getPromptBuilder, getVoicePromptBuilder } from './prompts.mjs';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Default model for text agent
const DEFAULT_MODEL = 'gpt-5.2';

// ═══════════════════════════════════════════════════════════════════════════════
// JWT VALIDATION (Auth0 JWKS)
// ═══════════════════════════════════════════════════════════════════════════════

// Cache the JWKS client per domain
const jwksClients = new Map();

function getJwksClient(auth0Domain) {
  if (!jwksClients.has(auth0Domain)) {
    jwksClients.set(auth0Domain, jwksClient({
      jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
      cache: true,
      cacheMaxAge: 600000, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    }));
  }
  return jwksClients.get(auth0Domain);
}

/**
 * Validates a JWT token against Auth0 JWKS
 * @param {string} authHeader - The Authorization header value
 * @returns {Promise<{valid: boolean, user?: object, error?: string}>}
 */
async function validateJWT(authHeader) {
  // Check if JWT validation is enabled
  const auth0Domain = process.env.AUTH0_DOMAIN;
  const auth0Audience = process.env.AUTH0_AUDIENCE;
  
  // If no Auth0 config, skip validation (allows gradual rollout)
  if (!auth0Domain) {
    console.log('[JWT] Skipping validation - AUTH0_DOMAIN not configured');
    return { valid: true, user: null, skipped: true };
  }
  
  // Check Authorization header format
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid Authorization header' };
  }
  
  const token = authHeader.slice(7); // Remove 'Bearer ' prefix
  
  if (!token || token === 'null' || token === 'undefined') {
    return { valid: false, error: 'Empty or invalid token' };
  }
  
  try {
    // Decode token header to get key ID (kid)
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header?.kid) {
      return { valid: false, error: 'Invalid token format - missing key ID' };
    }
    
    // Get signing key from JWKS
    const client = getJwksClient(auth0Domain);
    const key = await new Promise((resolve, reject) => {
      client.getSigningKey(decoded.header.kid, (err, signingKey) => {
        if (err) reject(err);
        else resolve(signingKey?.getPublicKey());
      });
    });
    
    if (!key) {
      return { valid: false, error: 'Unable to find signing key' };
    }
    
    // Verify token
    const verifyOptions = {
      algorithms: ['RS256'],
      issuer: `https://${auth0Domain}/`,
    };
    
    // Add audience check if configured
    if (auth0Audience) {
      verifyOptions.audience = auth0Audience;
    }
    
    const payload = jwt.verify(token, key, verifyOptions);
    
    // Token is valid
    return {
      valid: true,
      user: {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        // Include any other relevant claims
      }
    };
    
  } catch (err) {
    // Specific error messages for debugging
    if (err.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expired' };
    }
    if (err.name === 'JsonWebTokenError') {
      return { valid: false, error: `Invalid token: ${err.message}` };
    }
    if (err.name === 'NotBeforeError') {
      return { valid: false, error: 'Token not yet valid' };
    }
    
    console.error('[JWT] Validation error:', err);
    return { valid: false, error: err.message };
  }
}

/**
 * Helper to send 401 Unauthorized response
 */
function sendUnauthorized(responseStream, metadata, message) {
  metadata.statusCode = 401;
  metadata.headers['Content-Type'] = 'application/json';
  metadata.headers['WWW-Authenticate'] = 'Bearer realm="zunou-ai-proxy"';
  responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
  responseStream.write(JSON.stringify({ error: message }));
  responseStream.end();
  return responseStream;
}

export const handler = awslambda.streamifyResponse(async (event, responseStream, context) => {
  // Determine path for routing
  const path = event.requestContext?.http?.path || '/';
  
  // Set response metadata for SSE
  const metadata = {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  };
  
  // Handle CORS preflight (belt-and-suspenders, Function URL handles this)
  if (event.requestContext?.http?.method === 'OPTIONS') {
    metadata.statusCode = 204;
    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
    responseStream.end();
    return;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST ENDPOINT - No authentication required (for testing only)
  // ═══════════════════════════════════════════════════════════════════════════
  // Hello World endpoint for testing
  if (path === '/hello') {
    metadata.statusCode = 200;
    metadata.headers['Content-Type'] = 'application/json';
    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
    responseStream.write(JSON.stringify({
      message: 'Hello World!',
      timestamp: new Date().toISOString(),
      path: path,
      method: event.requestContext?.http?.method || 'GET',
    }));
    responseStream.end();
    return;
  }

  if (path === '/test' || path === '/health') {
    metadata.statusCode = 200;
    metadata.headers['Content-Type'] = 'application/json';
    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
    responseStream.write(JSON.stringify({
      status: 'ok',
      message: 'Lambda function is working!',
      timestamp: new Date().toISOString(),
      path: path,
      method: event.requestContext?.http?.method || 'GET',
      environment: {
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasAuth0Domain: !!process.env.AUTH0_DOMAIN,
        hasAuth0Audience: !!process.env.AUTH0_AUDIENCE,
        hasAssemblyAIKey: !!process.env.ASSEMBLYAI_API_KEY,
      }
    }));
    responseStream.end();
    return;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // JWT VALIDATION - All endpoints require valid Auth0 token
  // ═══════════════════════════════════════════════════════════════════════════
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  const jwtResult = await validateJWT(authHeader);
  
  if (!jwtResult.valid) {
    console.log('[JWT] Validation failed:', jwtResult.error);
    sendUnauthorized(responseStream, metadata, jwtResult.error);
    return;
  }
  
  if (jwtResult.skipped) {
    console.log('[JWT] Validation skipped (AUTH0_DOMAIN not configured)');
  } else {
    console.log('[JWT] Token valid for user:', jwtResult.user?.sub);
  }
  
  // Route: /realtime → Voice Agent session creation (Phase 4)
  if (path === '/realtime') {
    // Parse request body
    let body;
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (e) {
      metadata.statusCode = 400;
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({ error: 'Invalid JSON body' }));
      responseStream.end();
      return;
    }
    
    const {
      session_type = 'about-me',
      user_context = '',
      additional_context = '',
      day_context = {},  // For day-prep sessions
      model = 'gpt-4o-realtime-preview',
      voice = 'coral',
      language_instruction = '',
      dialect_instruction = '',
      speed_hint = '',
      style_instruction = '',
      // Audio config overrides (optional)
      vad_threshold = 0.3,
      vad_silence_duration_ms = 400,
    } = body;
    
    // Determine API key: BYOK header takes precedence over env var
    const byokKey = event.headers?.['x-openai-api-key'];
    const apiKey = byokKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      metadata.statusCode = 500;
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({ error: 'No API key configured' }));
      responseStream.end();
      return;
    }
    
    // Build system prompt using voice prompt builder
    const promptBuilder = getVoicePromptBuilder(session_type);
    let instructions;
    
    if (session_type === 'day-prep') {
      // Day-prep mode: specific day context from Schedule page
      instructions = promptBuilder({
        user_context,
        day_context,
      });
    } else {
      // Standard mode
      instructions = promptBuilder({
        user_context,
        additional_context,
      });
    }
    
    // Add language/dialect/speed/style instructions as prefixes
    if (language_instruction) {
      instructions = `${language_instruction}\n\n${instructions}`;
    }
    if (dialect_instruction) {
      instructions = `${dialect_instruction}\n\n${instructions}`;
    }
    if (speed_hint) {
      instructions = `${speed_hint}\n\n${instructions}`;
    }
    if (style_instruction) {
      instructions = `${style_instruction}\n\n${instructions}`;
    }
    
    // Get voice agent tools
    const tools = getTools('voice');
    
    console.log('[Lambda] Voice session:', session_type, '| tools:', tools.length, '| prompt length:', instructions.length);
    
    try {
      // Create OpenAI Realtime client secret via REST API
      // Endpoint: /v1/realtime/client_secrets (NOT /v1/realtime/sessions)
      // This returns an ephemeral client token (ek_...) that the frontend uses for WebSocket
      const sessionResponse = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Expiration config
          expires_after: {
            anchor: 'created_at',
            seconds: 120,  // 2 minutes - enough time to connect
          },
          // Session configuration (nested under 'session')
          session: {
            type: 'realtime',  // Required: 'realtime' or 'transcription'
            model,
            instructions,
            tools,
            tool_choice: 'auto',
            // Audio configuration (nested under 'audio' in the new API)
            audio: {
              input: {
                format: {
                  type: 'audio/pcm',
                  rate: 24000,
                },
                transcription: {
                  model: 'gpt-4o-transcribe',
                },
                turn_detection: {
                  type: 'server_vad',
                  threshold: vad_threshold,
                  prefix_padding_ms: 250,
                  silence_duration_ms: vad_silence_duration_ms,
                  create_response: true,
                },
              },
              output: {
                format: {
                  type: 'audio/pcm',
                  rate: 24000,
                },
                voice,
              },
            },
          },
        }),
      });
      
      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        console.error('OpenAI realtime session error:', sessionResponse.status, errorText);
        metadata.statusCode = sessionResponse.status;
        metadata.headers['Content-Type'] = 'application/json';
        responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
        responseStream.write(JSON.stringify({ error: errorText }));
        responseStream.end();
        return;
      }
      
      const sessionData = await sessionResponse.json();
      
      // Return the session info to the client
      // Response format: { value: "ek_...", expires_at: 123, session: { id, model, ... } }
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({
        token: sessionData.value,  // The ephemeral key (ek_...)
        session_id: sessionData.session?.id,
        expires_at: sessionData.expires_at,
        model: sessionData.session?.model,
        voice: sessionData.session?.audio?.output?.voice,
        tools_count: tools.length,
      }));
      responseStream.end();
      console.log('[Lambda] Voice session created:', sessionData.session?.id);
      return;
      
    } catch (error) {
      console.error('Realtime session creation error:', error);
      metadata.statusCode = 500;
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({ error: error.message }));
      responseStream.end();
      return;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Route: /assemblyai/token → Get streaming token for real-time transcription
  // ═══════════════════════════════════════════════════════════════════════════
  if (path === '/assemblyai/token') {
    // Determine API key: BYOK header takes precedence over env var
    const byokKey = event.headers?.['x-assemblyai-api-key'];
    const apiKey = byokKey || process.env.ASSEMBLYAI_API_KEY;
    
    if (!apiKey) {
      metadata.statusCode = 500;
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({ error: 'AssemblyAI API key not configured' }));
      responseStream.end();
      return;
    }
    
    try {
      // Request ephemeral streaming token from AssemblyAI
      // Token is valid for 60 seconds by default
      console.log('[Lambda] Fetching AssemblyAI streaming token...');
      
      const tokenResponse = await fetch('https://streaming.assemblyai.com/v3/token?expires_in_seconds=60', {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
        },
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('AssemblyAI token error:', tokenResponse.status, errorText);
        metadata.statusCode = tokenResponse.status;
        metadata.headers['Content-Type'] = 'application/json';
        responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
        responseStream.write(JSON.stringify({ error: `Failed to get token: ${errorText}` }));
        responseStream.end();
        return;
      }
      
      const tokenData = await tokenResponse.json();
      
      console.log('[Lambda] AssemblyAI streaming token obtained, expires in:', tokenData.expires_in_seconds, 's');
      
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({
        token: tokenData.token,
        expires_in_seconds: tokenData.expires_in_seconds,
      }));
      responseStream.end();
      return;
      
    } catch (error) {
      console.error('AssemblyAI token error:', error);
      metadata.statusCode = 500;
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({ error: error.message }));
      responseStream.end();
      return;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Route: /assemblyai/transcribe → Speaker diarization proxy
  // ═══════════════════════════════════════════════════════════════════════════
  if (path === '/assemblyai/transcribe') {
    // Parse request body
    let body;
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (e) {
      metadata.statusCode = 400;
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({ error: 'Invalid JSON body' }));
      responseStream.end();
      return;
    }
    
    const { audio_data, audio_url, speaker_labels = true, speakers_expected } = body;
    
    // Validate: need either audio_data or audio_url
    if (!audio_data && !audio_url) {
      metadata.statusCode = 400;
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({ error: 'Missing required field: audio_data or audio_url' }));
      responseStream.end();
      return;
    }
    
    // Determine API key: BYOK header takes precedence over env var
    const byokKey = event.headers?.['x-assemblyai-api-key'];
    const apiKey = byokKey || process.env.ASSEMBLYAI_API_KEY;
    
    if (!apiKey) {
      metadata.statusCode = 500;
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({ error: 'AssemblyAI API key not configured' }));
      responseStream.end();
      return;
    }
    
    const ASSEMBLYAI_API_URL = 'https://api.assemblyai.com/v2';
    
    try {
      let uploadUrl = audio_url;
      
      // Step 1: Upload audio if base64 data provided
      if (audio_data) {
        console.log('[Lambda] Uploading audio to AssemblyAI...');
        
        // Decode base64 to binary
        const audioBuffer = Buffer.from(audio_data, 'base64');
        
        const uploadResponse = await fetch(`${ASSEMBLYAI_API_URL}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/octet-stream',
          },
          body: audioBuffer,
        });
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('AssemblyAI upload error:', uploadResponse.status, errorText);
          metadata.statusCode = uploadResponse.status;
          metadata.headers['Content-Type'] = 'application/json';
          responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
          responseStream.write(JSON.stringify({ error: `Upload failed: ${errorText}` }));
          responseStream.end();
          return;
        }
        
        const uploadResult = await uploadResponse.json();
        uploadUrl = uploadResult.upload_url;
        console.log('[Lambda] Audio uploaded to:', uploadUrl);
      }
      
      // Step 2: Request transcription with speaker diarization
      console.log('[Lambda] Requesting transcription with speaker_labels:', speaker_labels);
      
      const transcriptRequest = {
        audio_url: uploadUrl,
        speaker_labels,
      };
      
      if (speakers_expected) {
        transcriptRequest.speakers_expected = speakers_expected;
      }
      
      const transcriptResponse = await fetch(`${ASSEMBLYAI_API_URL}/transcript`, {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transcriptRequest),
      });
      
      if (!transcriptResponse.ok) {
        const errorText = await transcriptResponse.text();
        console.error('AssemblyAI transcript request error:', transcriptResponse.status, errorText);
        metadata.statusCode = transcriptResponse.status;
        metadata.headers['Content-Type'] = 'application/json';
        responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
        responseStream.write(JSON.stringify({ error: `Transcription request failed: ${errorText}` }));
        responseStream.end();
        return;
      }
      
      const transcriptData = await transcriptResponse.json();
      const transcriptId = transcriptData.id;
      console.log('[Lambda] Transcription queued:', transcriptId);
      
      // Step 3: Poll for completion
      const maxPolls = 120;  // 10 minutes max (5s intervals)
      const pollInterval = 5000;
      
      for (let poll = 0; poll < maxPolls; poll++) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        const statusResponse = await fetch(`${ASSEMBLYAI_API_URL}/transcript/${transcriptId}`, {
          headers: {
            'Authorization': apiKey,
          },
        });
        
        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          console.error('AssemblyAI status check error:', statusResponse.status, errorText);
          continue;  // Retry
        }
        
        const statusData = await statusResponse.json();
        
        if (statusData.status === 'completed') {
          console.log('[Lambda] Transcription completed:', transcriptId);
          
          metadata.headers['Content-Type'] = 'application/json';
          responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
          responseStream.write(JSON.stringify({
            success: true,
            transcript: {
              id: statusData.id,
              text: statusData.text,
              utterances: statusData.utterances || [],
              words: statusData.words || [],
            },
          }));
          responseStream.end();
          return;
        }
        
        if (statusData.status === 'error') {
          console.error('[Lambda] Transcription failed:', statusData.error);
          metadata.statusCode = 500;
          metadata.headers['Content-Type'] = 'application/json';
          responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
          responseStream.write(JSON.stringify({ error: statusData.error || 'Transcription failed' }));
          responseStream.end();
          return;
        }
        
        console.log('[Lambda] Transcription status:', statusData.status, `(poll ${poll + 1}/${maxPolls})`);
      }
      
      // Timeout
      metadata.statusCode = 504;
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({ error: 'Transcription timed out' }));
      responseStream.end();
      return;
      
    } catch (error) {
      console.error('AssemblyAI proxy error:', error);
      metadata.statusCode = 500;
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({ error: error.message }));
      responseStream.end();
      return;
    }
  }
  
  // Route: /conversations → Create conversation for multi-turn state
  if (path === '/conversations') {
    // Determine API key: BYOK header takes precedence over env var
    const byokKey = event.headers?.['x-openai-api-key'];
    const apiKey = byokKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      metadata.statusCode = 500;
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({ error: 'No API key configured' }));
      responseStream.end();
      return;
    }
    
    // Parse optional body for metadata
    let conversationMetadata = {};
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      conversationMetadata = body.metadata || {};
    } catch (e) {
      // Ignore parse errors, use empty metadata
    }
    
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            agent: 'text-agent',
            created: new Date().toISOString(),
            ...conversationMetadata,
          }
        }),
      });
      
      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error('OpenAI conversations error:', openaiResponse.status, errorText);
        metadata.statusCode = openaiResponse.status;
        metadata.headers['Content-Type'] = 'application/json';
        responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
        responseStream.write(JSON.stringify({ error: errorText }));
        responseStream.end();
        return;
      }
      
      const conversationData = await openaiResponse.json();
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify(conversationData));
      responseStream.end();
      console.log('[Lambda] Created conversation:', conversationData.id);
      return;
      
    } catch (error) {
      console.error('Conversation creation error:', error);
      metadata.statusCode = 500;
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({ error: error.message }));
      responseStream.end();
      return;
    }
  }
  
  // Route: /responses → Text Agent SSE proxy
  // Reject unknown paths explicitly
  if (path !== '/responses') {
    metadata.statusCode = 404;
    metadata.headers['Content-Type'] = 'application/json';
    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
    responseStream.write(JSON.stringify({ error: `Unknown endpoint: ${path}` }));
    responseStream.end();
    return;
  }
  
  // Parse request body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    metadata.statusCode = 400;
    metadata.headers['Content-Type'] = 'application/json';
    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
    responseStream.write(JSON.stringify({ error: 'Invalid JSON body' }));
    responseStream.end();
    return;
  }
  
  // Determine which mode we're in
  // Obfuscated mode: has session_type and we build the prompt server-side
  // Pass-through mode: no session_type, request goes to OpenAI as-is
  // Note: 'draft' session_type passes 'instructions' as task instructions, not OpenAI instructions
  const isObfuscatedMode = !!body.session_type && !body.tools;
  
  let openaiRequest;
  
  if (isObfuscatedMode) {
    // ═══════════════════════════════════════════════════════════════════════════
    // OBFUSCATED MODE: Build request from session_type
    // ═══════════════════════════════════════════════════════════════════════════
    
    const {
      session_type = 'general',
      input,
      user_context = '',
      additional_context = {},
      language = 'English',
      time_of_day = 'morning',
      model = DEFAULT_MODEL,
      temperature = 0.7,
      max_output_tokens,  // Optional: limit output length
      conversation,  // Optional: for multi-turn
    } = body;
    
    // Validate required field
    if (!input) {
      metadata.statusCode = 400;
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({ error: 'Missing required field: input' }));
      responseStream.end();
      return;
    }
    
    // Build system prompt using the prompt builder
    const promptBuilder = getPromptBuilder(session_type);
    
    // Draft session type has different parameters
    let instructions;
    if (session_type === 'draft') {
      // Draft mode: use task-specific parameters
      const {
        task_type = 'other',
        instructions: draftInstructions = '',
        context = '',
        recipient = '',
        subject = '',
      } = body;
      
      instructions = promptBuilder({
        task_type,
        instructions: draftInstructions,
        context,
        recipient,
        subject,
        user_context, // Pass user context so draft knows user's name, org, etc.
      });
    } else if (session_type === 'day-prep') {
      // Day-prep mode: specific day context from Schedule page
      const { day_context = {} } = body;
      
      instructions = promptBuilder({
        language,
        user_context,
        day_context,
        model,
      });
    } else {
      // Standard mode: use normal parameters
      instructions = promptBuilder({
        language,
        time_of_day,
        user_context,
        additional_context,
        model,
      });
    }
    
    // Build the OpenAI request
    openaiRequest = {
      model,
      stream: true,
      instructions,
      input,
      temperature,
    };
    
    // Add tools for interactive sessions (digest and draft are simple text generation)
    if (session_type !== 'digest' && session_type !== 'draft') {
      const tools = getTools('text');
      openaiRequest.tools = tools;
      openaiRequest.tool_choice = 'auto';
    }
    
    // Add max_output_tokens if specified
    if (max_output_tokens) {
      openaiRequest.max_output_tokens = max_output_tokens;
    }
    
    // Add conversation for multi-turn if provided
    if (conversation) {
      openaiRequest.conversation = conversation;
    }
    
    const toolCount = openaiRequest.tools?.length || 0;
    console.log('[Lambda] Obfuscated mode:', session_type, '| tools:', toolCount, '| prompt length:', instructions.length);
    
  } else {
    // ═══════════════════════════════════════════════════════════════════════════
    // PASS-THROUGH MODE: Forward request as-is (legacy/BYOK compatibility)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Validate required fields for pass-through
    if (!body.model || !body.input) {
      metadata.statusCode = 400;
      metadata.headers['Content-Type'] = 'application/json';
      responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
      responseStream.write(JSON.stringify({ error: 'Missing required fields: model, input' }));
      responseStream.end();
      return;
    }
    
    // Use request as-is, just ensure streaming
    openaiRequest = {
      ...body,
      stream: true,
    };
    
    console.log('[Lambda] Pass-through mode | model:', body.model);
  }
  
  // Determine API key: BYOK header takes precedence over env var
  const byokKey = event.headers?.['x-openai-api-key'];
  const apiKey = byokKey || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    metadata.statusCode = 500;
    metadata.headers['Content-Type'] = 'application/json';
    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
    responseStream.write(JSON.stringify({ error: 'No API key configured' }));
    responseStream.end();
    return;
  }
  
  // Apply response stream metadata
  responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
  
  try {
    // Call OpenAI Responses API
    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiRequest),
    });
    
    // Check for OpenAI errors
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI error:', openaiResponse.status, errorText);
      responseStream.write(`event: error\ndata: ${JSON.stringify({ error: errorText })}\n\n`);
      responseStream.end();
      return;
    }
    
    // Pipe OpenAI's SSE stream directly to client
    const reader = openaiResponse.body.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      responseStream.write(value);
    }
    
    responseStream.end();
    
  } catch (error) {
    console.error('Proxy error:', error);
    responseStream.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    responseStream.end();
  }
});
