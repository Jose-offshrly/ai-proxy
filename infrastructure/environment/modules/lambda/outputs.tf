output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = module.lambda_function.lambda_function_arn
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = module.lambda_function.lambda_function_name
}

output "lambda_function_url" {
  description = "Function URL of the Lambda"
  value       = aws_lambda_function_url.scout_ai_proxy.function_url
}

output "ecr_repository_url" {
  description = "ECR repository URL for scout-ai-proxy"
  value       = module.docker_image.image_uri
}
