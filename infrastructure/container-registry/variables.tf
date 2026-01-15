locals {
  prefix     = "cr" # The prefix used to name resources (mirrors zunou-services).
  aws_region = "ap-southeast-2"
  tags = {
    Project     = "Scout"
    Environment = "staging"
    ManagedBy   = "Terraform"
  }
}

