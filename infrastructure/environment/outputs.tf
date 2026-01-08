output "lambda_function_arn" {
  description = "ARN of the scout-ai-proxy Lambda function"
  value       = module.lambda.lambda_function_arn
}

output "lambda_function_url" {
  description = "Function URL of the scout-ai-proxy Lambda"
  value       = module.lambda.lambda_function_url
}

output "lambda_function_name" {
  description = "Name of the scout-ai-proxy Lambda function"
  value       = module.lambda.lambda_function_name
}

