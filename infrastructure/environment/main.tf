locals {
  aws_region = var.aws_region

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = "Scout"
  }
}

module "iam" {
  source = "./modules/iam"

  environment = var.environment
  tags        = local.tags
}

module "lambda" {
  source = "./modules/lambda"

  environment               = var.environment
  lambda_execution_role_arn = module.iam.lambda_execution_role_arn

  # Environment variables
  openai_api_key     = var.openai_api_key
  auth0_domain       = var.auth0_domain
  auth0_audience     = var.auth0_audience
  assemblyai_api_key = var.assemblyai_api_key
}

