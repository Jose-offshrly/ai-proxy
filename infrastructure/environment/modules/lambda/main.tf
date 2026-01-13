# Create bootstrap Lambda zip using native Terraform archive provider
# This ensures the S3 file always exists before Lambda creation (first apply only)
# The archive provider is built into Terraform (no external dependencies)
data "archive_file" "bootstrap_lambda" {
  type        = "zip"
  output_path = "${path.module}/build/bootstrap-${var.environment}.zip"

  source {
    filename = "index.mjs"
    content  = <<EOF
export const handler = async () => ({
  statusCode: 200,
  body: JSON.stringify({ message: "bootstrap - replaced by CI" })
});
EOF
  }

  source {
    filename = "package.json"
    content  = <<EOF
{
  "type": "module",
  "name": "scout-ai-proxy-bootstrap",
  "version": "1.0.0"
}
EOF
  }
}

# Upload bootstrap Lambda to S3
# Terraform creates it once, then CI can overwrite it
resource "aws_s3_object" "bootstrap_lambda" {
  bucket      = "zunou"
  key         = var.scout_ai_proxy_s3_key
  source      = data.archive_file.bootstrap_lambda.output_path
  source_hash  = data.archive_file.bootstrap_lambda.output_base64sha256

  # Allow CI to overwrite this file - Terraform won't try to "fix" it
  lifecycle {
    ignore_changes = [source_hash, etag]
  }
}

# Scout AI Proxy Lambda Function
resource "aws_lambda_function" "scout_ai_proxy" {
  function_name = "scout-ai-proxy-${var.environment}"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role          = var.lambda_execution_role_arn

  # Reference the S3 bucket and key where your zip is located
  # Note: Bucket must be in the same region as Lambda (ap-southeast-2)
  # Code updates are handled via Makefile/CLI, not Terraform
  s3_bucket = "zunou"
  s3_key    = aws_s3_object.bootstrap_lambda.key

  # Ignore changes to S3 key so CI deployments can update code
  lifecycle {
    ignore_changes = [s3_key]
  }

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

