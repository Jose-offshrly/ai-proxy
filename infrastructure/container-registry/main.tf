module "ecr" {
  source = "./modules/ecr"

  prefix = local.prefix
  tags   = local.tags
}

