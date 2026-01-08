locals {
  aws_region = var.aws_region

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = "Scout"
  }

  # Default S3 key if not provided via variable (matches Makefile ZIP_FILE)
  scout_ai_proxy_s3_key = var.scout_ai_proxy_s3_key != "" ? var.scout_ai_proxy_s3_key : "scout_ai_proxy_lambda_function.zip"
  
  # Path to Lambda source code (relative to this Terraform directory)
  lambda_source_path = "${path.module}/../../services/ai-proxy"
}

# Automatically build and upload Lambda code to S3 before creating Lambda function
resource "null_resource" "build_and_upload_lambda" {
  triggers = {
    # Rebuild when source code changes
    source_hash = sha256(join("", [
      for f in fileset(local.lambda_source_path, "*.mjs") : filesha256("${local.lambda_source_path}/${f}")
    ]))
    package_json = filesha256("${local.lambda_source_path}/package.json")
  }

  provisioner "local-exec" {
    command = <<-EOT
      cd ${local.lambda_source_path} && \
      make build-and-upload
    EOT
  }
}

module "iam" {
  source = "./modules/iam"

  environment = var.environment
  tags        = local.tags
}

module "cloudwatch" {
  source = "./modules/cloudwatch"

  environment = var.environment
  tags        = local.tags
}

module "lambda" {
  source = "./modules/lambda"

  environment                 = var.environment
  lambda_execution_role_arn   = module.iam.lambda_execution_role_arn
  scout_ai_proxy_s3_key       = local.scout_ai_proxy_s3_key
  scout_ai_proxy_log_group_arn = module.cloudwatch.scout_ai_proxy_log_group_arn
  
  # Environment variables
  openai_api_key    = var.openai_api_key
  auth0_domain      = var.auth0_domain
  auth0_audience     = var.auth0_audience
  assemblyai_api_key = var.assemblyai_api_key

  # Ensure Lambda code is built and uploaded before creating Lambda function
  depends_on = [null_resource.build_and_upload_lambda]
}

