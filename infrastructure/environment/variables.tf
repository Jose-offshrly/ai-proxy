variable "environment" {
  description = "The deployment environment (e.g., dev, staging, production)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Allowed values for environment are \"dev\", \"staging\", or \"production\"."
  }
}

variable "aws_region" {
  description = "The AWS region where resources are deployed"
  type        = string
  default     = "ap-southeast-2"
}

variable "scout_ai_proxy_s3_key" {
  description = "S3 key for the scout-ai-proxy Lambda deployment package. If empty, uses default key."
  type        = string
  default     = ""
}

variable "openai_api_key" {
  description = "OpenAI API key for scout-ai-proxy Lambda"
  type        = string
  sensitive   = true
  default     = ""
}

variable "auth0_domain" {
  description = "Auth0 domain for scout-ai-proxy Lambda"
  type        = string
  default     = ""
}

variable "auth0_audience" {
  description = "Auth0 audience for scout-ai-proxy Lambda"
  type        = string
  default     = ""
}

variable "assemblyai_api_key" {
  description = "AssemblyAI API key for scout-ai-proxy Lambda"
  type        = string
  sensitive   = true
  default     = ""
}

