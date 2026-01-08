output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.scout_ai_proxy.arn
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.scout_ai_proxy.function_name
}

output "lambda_function_url" {
  description = "Function URL of the Lambda"
  value       = aws_lambda_function_url.scout_ai_proxy.function_url
}

