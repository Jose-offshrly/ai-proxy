output "scout_ai_proxy_log_group_arn" {
  description = "ARN of the CloudWatch log group for scout-ai-proxy"
  value       = aws_cloudwatch_log_group.scout_ai_proxy.arn
}

