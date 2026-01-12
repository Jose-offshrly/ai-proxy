# Terraform Infrastructure Setup Guide

This directory contains Terraform configuration for deploying the Scout AI Proxy Lambda infrastructure.

## Overview

- **Terraform**: Manages infrastructure (IAM roles, CloudWatch logs, Lambda function definition)
- **Makefile/GitHub Actions**: Handles code deployment (build, upload to S3, update Lambda)

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

4. **S3 bucket exists** (for Lambda code)
   - Bucket: `zunou`
   - Region: `ap-southeast-2`
   - If it doesn't exist, create it:
     ```bash
     aws s3 mb s3://zunou --region ap-southeast-2
     ```

## Initial Setup

### 1. Build and Upload Code

Before running Terraform, build and upload the Lambda code to S3:

```bash
cd ../../services/ai-proxy
make deploy-stg  # or deploy-dev, deploy-prod
```

This will:
- Install dependencies
- Create zip file
- Upload to S3 bucket `zunou`
- Skip Lambda update gracefully if function doesn't exist yet

### 2. Configure Terraform

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
environment = "dev"  # or "staging"

openai_api_key    = "sk-..."
auth0_domain      = "your-domain.auth0.com"
auth0_audience     = "https://your-api"
assemblyai_api_key = "your-assemblyai-key"
```

**Note:** The `scout_ai_proxy_s3_key` can be left empty. Terraform will use the default key name (`scout_ai_proxy_lambda_function.zip`).

### 3. Deploy Infrastructure

```bash
terraform init
terraform plan -var-file=terraform.staging.tfvars  # or terraform.dev.tfvars
terraform apply -var-file=terraform.staging.tfvars
```

This creates:
- IAM role: `scout-lambda-exec-role-{environment}`
- IAM policy: `scout-lambda-logging-policy-{environment}`
- CloudWatch log group: `/aws/lambda/scout-ai-proxy-{environment}`
- Lambda function: `scout-ai-proxy-{environment}` (references the S3 file)
- Lambda Function URL (public HTTP endpoint)

### 4. Get Function URL

```bash
terraform output lambda_function_url
```

## Code Updates

After initial setup, code updates are automatic:

- **GitHub Actions**: When `services/ai-proxy/**` changes are pushed to `staging`, the workflow automatically builds, uploads, and updates Lambda
- **Manual**: Run `make deploy-stg` (or `deploy-dev`/`deploy-prod`)

**No Terraform needed** for code updates - only for infrastructure changes.

## Troubleshooting

**S3 file not found**
```bash
cd ../../services/ai-proxy
make deploy-stg
```

**Access Denied**
- Check AWS credentials have `s3:PutObject` permission on `zunou` bucket
- Check AWS credentials have `lambda:UpdateFunctionCode` permission

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

**Warning:** This will delete the Lambda function, IAM role, log group, and Function URL.
