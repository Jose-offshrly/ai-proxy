# Build Docker image and push to ECR
# ECR repository is created automatically by docker-build module
module "docker_image" {
  source = "terraform-aws-modules/lambda/aws//modules/docker-build"

  create_ecr_repo = true
  ecr_repo        = "scout-ai-proxy"

  # Use hash-based tags for better change detection
  use_image_tag = false

  # Path to the service directory containing Dockerfile
  source_path = "${path.module}/../../../../services/ai-proxy"

  # Rebuild on any source file change
  triggers = {
    source_hash = sha256(join("", [
      for f in fileset("${path.module}/../../../../services/ai-proxy", "**") :
      filesha256("${path.module}/../../../../services/ai-proxy/${f}")
    ]))
  }
}

# Scout AI Proxy Lambda Function (container image)
module "lambda_function" {
  source = "terraform-aws-modules/lambda/aws"

  function_name  = "scout-ai-proxy-${var.environment}"
  create_package = false

  image_uri    = module.docker_image.image_uri
  package_type = "Image"

  # Use existing IAM role (don't create a new one)
  create_role = false
  lambda_role = var.lambda_execution_role_arn

  # CloudWatch log group is created automatically by Lambda module

  # Environment variables
  environment_variables = {
      OPENAI_API_KEY     = var.openai_api_key
      AUTH0_DOMAIN       = var.auth0_domain
    AUTH0_AUDIENCE     = var.auth0_audience
      ASSEMBLYAI_API_KEY = var.assemblyai_api_key
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
  function_name      = module.lambda_function.lambda_function_name
  authorization_type = "NONE"            # Auth is handled in Lambda code via JWT
  invoke_mode        = "RESPONSE_STREAM" # Required for awslambda.streamifyResponse() in code

  cors {
    allow_credentials = false # Matches AWS Console default
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    expose_headers    = ["*"]
    max_age           = 86400
  }
}

# Resource-based policy to allow public invocation
resource "aws_lambda_permission" "allow_public_invoke_function" {
  statement_id  = "FunctionURLAllowInvokeAction"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_function.lambda_function_name
  principal     = "*"
}
