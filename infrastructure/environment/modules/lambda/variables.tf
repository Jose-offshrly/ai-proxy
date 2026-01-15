variable "environment" {
  description = "The deployment environment"
  type        = string
}

variable "lambda_execution_role_arn" {
  description = "ARN of the Lambda execution role"
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

