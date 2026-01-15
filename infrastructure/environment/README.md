# Terraform Infrastructure Setup Guide

This directory contains Terraform configuration for deploying the Scout AI Proxy Lambda infrastructure.

## Overview

- **Terraform**: Manages infrastructure (IAM roles, CloudWatch logs, Lambda function, ECR repository, Docker image build)
- **Makefile/GitHub Actions**: Handles code deployment (build Docker image, push to ECR, update Lambda)

## Prerequisites

1. **AWS CLI installed and configured**
   ```bash
   aws --version
   ```

2. **AWS credentials configured**
   ```bash
   aws configure
   ```

3. **Terraform installed** (version >= 1.0)
   ```bash
   terraform version
   ```

4. **Docker installed** (for building container images)
   ```bash
   docker --version
   ```

## Initial Setup

### 1. Configure Terraform

Create environment-specific tfvars file:

**For DEV:**
```bash
cp terraform.dev.tfvars.example terraform.dev.tfvars
```

**For STAGING:**
```bash
cp terraform.staging.tfvars.example terraform.staging.tfvars
```

Edit the tfvars file:

```hcl
environment = "staging"  # or "dev"

openai_api_key    = "sk-..."
auth0_domain      = "your-domain.auth0.com"
auth0_audience     = "https://your-api"
assemblyai_api_key = "your-assemblyai-key"
```

### 2. Deploy Infrastructure

```bash
terraform init
terraform plan -var-file=terraform.staging.tfvars  # or terraform.dev.tfvars
terraform apply -var-file=terraform.staging.tfvars
```

This creates:
- **ECR repository**: `scout-ai-proxy` (created by docker-build module)
- **Docker image**: Built and pushed to ECR automatically
- **IAM role**: `scout-lambda-exec-role-{environment}`
- **IAM policy**: `scout-lambda-logging-policy-{environment}`
- **CloudWatch log group**: `/aws/lambda/scout-ai-proxy-{environment}` (created by Lambda module)
- **Lambda function**: `scout-ai-proxy-{environment}` (container image)
- **Lambda Function URL**: Public HTTP endpoint

### 3. Get Function URL

```bash
terraform output lambda_function_url
```

## Code Updates

After initial setup, code updates can be done via:

- **GitHub Actions**: When `services/ai-proxy/**` changes are pushed to `staging`, the workflow automatically builds Docker image, pushes to ECR, and updates Lambda
- **Manual**: Run `make deploy-stg` (or `deploy-dev`/`deploy-prod`) in `services/ai-proxy/`

**Note:** Terraform's docker-build module will rebuild the image if source files change. For CI/CD deployments, GitHub Actions/Makefile handles the build and push.

## Troubleshooting

**Docker build fails**
- Ensure Docker is installed and running
- Check Dockerfile is correct

**ECR push fails**
- Check AWS credentials have ECR push permissions
- Verify ECR repository exists (created by Terraform)

**Lambda update fails**
- Check AWS credentials have `lambda:UpdateFunctionCode` permission
- Verify Lambda function exists

**Resource already exists**
- If re-running, you may need to import existing resources or destroy first:
  ```bash
  terraform destroy -var-file=terraform.staging.tfvars
  ```

## Destroying Infrastructure

To remove all resources:

```bash
terraform destroy -var-file=terraform.staging.tfvars
```

**Warning:** This will delete the Lambda function, IAM role, log group, Function URL, ECR repository, and all images.
