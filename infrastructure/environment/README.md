# Terraform Infrastructure Setup Guide

This directory contains Terraform configuration for deploying the Scout AI Proxy Lambda infrastructure.

## Prerequisites

1. **AWS CLI installed and configured**
   ```bash
   aws --version
   # If not installed: brew install awscli (macOS) or follow AWS docs
   ```

2. **AWS credentials configured**
   ```bash
   aws configure
   # Or set environment variables:
   # export AWS_ACCESS_KEY_ID=your-key
   # export AWS_SECRET_ACCESS_KEY=your-secret
   # export AWS_DEFAULT_REGION=ap-southeast-2
   ```

3. **Terraform installed** (version >= 1.0)
   ```bash
   terraform version
   # If not installed: brew install terraform (macOS) or download from hashicorp.com
   ```

4. **S3 bucket exists** (for Lambda code)
   - Bucket: `zunou`
   - Region: `ap-southeast-2`
   - If it doesn't exist, create it:
     ```bash
     aws s3 mb s3://zunou --region ap-southeast-2
     ```

## Environment-Specific Configuration

This project uses environment-specific tfvars files:
- `terraform.dev.tfvars` - For DEV environment
- `terraform.staging.tfvars` - For STAGING environment

Each environment has its own Lambda function, IAM role, and CloudWatch log group.

**Note:** If you have an existing `terraform.tfvars` file, you can migrate it to `terraform.dev.tfvars` for consistency.

### Quick Reference: Commands by Environment

**DEV Environment:**
```bash
# Plan
terraform plan -var-file=terraform.dev.tfvars

# Apply
terraform apply -var-file=terraform.dev.tfvars

# Destroy
terraform destroy -var-file=terraform.dev.tfvars
```

**STAGING Environment:**
```bash
# Plan
terraform plan -var-file=terraform.staging.tfvars

# Apply
terraform apply -var-file=terraform.staging.tfvars

# Destroy
terraform destroy -var-file=terraform.staging.tfvars
```

## Step-by-Step Setup

### Step 1: Navigate to Infrastructure Directory

```bash
cd infrastructure/environment
```

### Step 2: Build and Upload Lambda Code (First Time Only)

Before running Terraform, you need to build and upload the Lambda code to S3:

```bash
cd ../../services/ai-proxy
make deploy-dev
```

This will:
- Install dependencies
- Create the zip file
- Upload to S3 bucket `zunou`

**Note:** This is a one-time step for initial setup. After infrastructure is created, GitHub Actions will handle all future code deployments automatically.

### Step 3: Create Environment-Specific tfvars Files

Copy the example file for your environment and fill in your values:

**For DEV environment:**
```bash
cd ../../infrastructure/environment
cp terraform.dev.tfvars.example terraform.dev.tfvars
```

**For STAGING environment:**
```bash
cp terraform.staging.tfvars.example terraform.staging.tfvars
```

Edit the tfvars file with your actual values:

```hcl
environment = "dev"  # or "staging"

openai_api_key    = "sk-..."
auth0_domain      = "your-domain.auth0.com"
auth0_audience     = "https://your-api"
assemblyai_api_key = "your-assemblyai-key"
```

**Note:** The `scout_ai_proxy_s3_key` can be left empty. Terraform will use the default key name (`scout_ai_proxy_lambda_function.zip`).

### Step 4: Initialize Terraform

```bash
terraform init
```

This downloads the AWS provider and sets up Terraform.

### Step 5: Review the Plan

**For DEV environment:**
```bash
terraform plan -var-file=terraform.dev.tfvars
```

**For STAGING environment:**
```bash
terraform plan -var-file=terraform.staging.tfvars
```

This shows what Terraform will create:
- IAM role: `scout-lambda-exec-role-{environment}`
- IAM policy: `scout-lambda-logging-policy-{environment}`
- CloudWatch log group: `/aws/lambda/scout-ai-proxy-{environment}`
- Lambda function: `scout-ai-proxy-{environment}`
- Lambda Function URL (public HTTP endpoint)

**Important:** Make sure the plan looks correct before applying!

### Step 6: Apply Infrastructure

**For DEV environment:**
```bash
terraform apply -var-file=terraform.dev.tfvars
```

**For STAGING environment:**
```bash
terraform apply -var-file=terraform.staging.tfvars
```

Terraform will prompt you to confirm. Type `yes` to proceed.

This will create all the infrastructure resources. It may take 1-2 minutes.

### Step 7: Get the Function URL

After apply completes, get the Function URL:

```bash
terraform output lambda_function_url
```

Or view all outputs:

```bash
terraform output
```

You should see:
- `lambda_function_arn` - ARN of the Lambda
- `lambda_function_url` - Public HTTP endpoint
- `lambda_function_name` - Name of the function

## What Gets Created

1. **IAM Role** (`scout-lambda-exec-role-dev`)
   - Allows Lambda to assume the role
   - Has CloudWatch logging permissions

2. **CloudWatch Log Group** (`/aws/lambda/scout-ai-proxy-dev`)
   - Stores Lambda execution logs
   - 14-day retention

3. **Lambda Function** (`scout-ai-proxy-dev`)
   - Runtime: Node.js 20.x
   - Handler: `index.handler`
   - Timeout: 120 seconds
   - Environment variables: OPENAI_API_KEY, AUTH0_DOMAIN, AUTH0_AUDIENCE, ASSEMBLYAI_API_KEY
   - **Note:** Function code will be empty initially (just the skeleton)

4. **Lambda Function URL**
   - Public HTTP endpoint
   - CORS enabled
   - Response streaming enabled

## Next Steps

After infrastructure is created:

1. **Test the Function URL:**
   ```bash
   curl $(terraform output -raw lambda_function_url)/test
   ```

2. **Future code updates:**
   - Push changes to `main` branch
   - GitHub Actions will automatically build and deploy the new code
   - No need to run Terraform again for code changes

## Troubleshooting

### Error: "Bucket does not exist"
- Create the S3 bucket first:
  ```bash
  aws s3 mb s3://zunou-lambda-code-ap-southeast-2 --region ap-southeast-2
  ```

### Error: "Access Denied"
- Check your AWS credentials:
  ```bash
  aws sts get-caller-identity
  ```
- Ensure your IAM user/role has permissions for:
  - Lambda (create function, create function URL)
  - IAM (create role, create policy)
  - CloudWatch (create log group)
  - S3 (read from bucket)

### Error: "Resource already exists"
- If you're re-running, you may need to import existing resources or destroy first:
  ```bash
  terraform destroy  # ⚠️ Destroys all resources
  ```

## Destroying Infrastructure

To remove all resources:

**For DEV environment:**
```bash
terraform destroy -var-file=terraform.dev.tfvars
```

**For STAGING environment:**
```bash
terraform destroy -var-file=terraform.staging.tfvars
```

**Warning:** This will delete the Lambda function, IAM role, log group, and Function URL. Make sure you want to do this!

## Environment Variables

The Lambda function will have these environment variables set:
- `OPENAI_API_KEY` - From terraform.tfvars
- `AUTH0_DOMAIN` - From terraform.tfvars
- `AUTH0_AUDIENCE` - From terraform.tfvars
- `ASSEMBLYAI_API_KEY` - From terraform.tfvars

These are set during `terraform apply` and won't change unless you run Terraform again.

