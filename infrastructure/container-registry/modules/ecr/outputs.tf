# ECR repository is now created by docker-build module in environment stack
output "repository_arns" {
  value       = []
  description = "The ARNs of our container repositories (ECR repos are now managed by docker-build module)"
}
