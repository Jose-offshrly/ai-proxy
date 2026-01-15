# Scout AI Proxy Lambda Function (S3 ZIP deployment)
# ZIP file is built and uploaded to S3 by GitHub Actions / Makefile
resource "aws_lambda_function" "scout_ai_proxy" {
  function_name = "scout-ai-proxy-${var.environment}"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role          = var.lambda_execution_role_arn

  # Reference the S3 bucket and key where your zip is located.
  # The ZIP is created by CI (Makefile) and stored in this bucket.
  s3_bucket = "zunou"
  s3_key    = var.scout_ai_proxy_s3_key

  environment {
    variables = {
      OPENAI_API_KEY     = var.openai_api_key
      AUTH0_DOMAIN       = var.auth0_domain
      AUTH0_AUDIENCE       = var.auth0_audience
      ASSEMBLYAI_API_KEY = var.assemblyai_api_key
    }
  }

  # Timeout for AI responses (can take 30-60+ seconds)
  timeout = 120

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = "Scout"
  }
}

# Lambda Function URL for HTTP access
resource "aws_lambda_function_url" "scout_ai_proxy" {
  function_name      = aws_lambda_function.scout_ai_proxy.function_name
  authorization_type = "NONE" # Auth is handled in Lambda code via JWT
  invoke_mode        = "RESPONSE_STREAM" # Required for awslambda.streamifyResponse() in code

  cors {
    allow_credentials = false # Matches AWS Console default
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    expose_headers    = ["*"]
    max_age          = 86400
  }
}

# Resource-based policy to allow public invocation
resource "aws_lambda_permission" "allow_public_invoke_function" {
  statement_id  = "FunctionURLAllowInvokeAction"
  action       = "lambda:InvokeFunction"
  function_name = aws_lambda_function.scout_ai_proxy.function_name
  principal    = "*"
}

