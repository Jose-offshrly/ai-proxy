variable "environment" {
  description = "The deployment environment"
  type        = string
}

variable "lambda_execution_role_arn" {
  description = "ARN of the Lambda execution role"
  type        = string
}

variable "scout_ai_proxy_s3_key" {
  description = "S3 key for the Lambda deployment package"
  type        = string
  default     = "scout_ai_proxy_lambda_function.zip"
}

variable "scout_ai_proxy_log_group_arn" {
  description = "ARN of the CloudWatch log group"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "auth0_domain" {
  description = "Auth0 domain"
  type        = string
  default     = ""
}

variable "auth0_audience" {
  description = "Auth0 audience"
  type        = string
  default     = ""
}

variable "assemblyai_api_key" {
  description = "AssemblyAI API key"
  type        = string
  sensitive   = true
  default     = ""
}

