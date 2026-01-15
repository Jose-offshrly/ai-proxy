resource "aws_cloudwatch_log_group" "scout_ai_proxy" {
  name              = "/aws/lambda/scout-ai-proxy-${var.environment}"
  retention_in_days = 14
  tags              = var.tags
}
