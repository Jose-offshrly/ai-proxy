# ECR repository is now created by docker-build module in environment stack
# resource "aws_ecr_repository" "scout_ai_proxy" {
#   name                 = "scout-ai-proxy"
#   image_tag_mutability = "MUTABLE"
#
#   image_scanning_configuration {
#     scan_on_push = true
#   }
#
#   tags = var.tags
# }
