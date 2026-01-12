locals {
  aws_region = var.aws_region

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = "Scout"
  }

  # Default S3 key if not provided via variable (matches Makefile ZIP_FILE)
  scout_ai_proxy_s3_key = var.scout_ai_proxy_s3_key != "" ? var.scout_ai_proxy_s3_key : "scout_ai_proxy_lambda_function.zip"
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
}

