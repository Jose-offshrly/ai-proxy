# Define variables

# AWS region for ECR/Lambda
AWS_REGION ?= ap-southeast-2

# ECR repository name (must exist or be created by Terraform)
ECR_REPO_NAME := scout-ai-proxy

# Lambda function names per environment
FUNCTION_DEV := scout-ai-proxy-dev
FUNCTION_STG := scout-ai-proxy-staging
FUNCTION_PROD := scout-ai-proxy-production

# Default environment (can be overridden)
ENV := dev
FUNCTION_NAME := $(FUNCTION_DEV)

ifeq ($(ENV),stg)
    FUNCTION_NAME := $(FUNCTION_STG)
endif

ifeq ($(ENV),prod)
    FUNCTION_NAME := $(FUNCTION_PROD)
endif

# Resolve AWS account and image URI
AWS_ACCOUNT_ID := $(shell aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

# Use git SHA if available, otherwise 'latest'
IMAGE_TAG ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo latest)
IMAGE_URI := $(ECR_REGISTRY)/$(ECR_REPO_NAME):$(IMAGE_TAG)

# Deploy the Lambda function (builds image, pushes to ECR, and updates Lambda if it exists)
# For initial setup: Run this before Terraform. It will push the image and skip Lambda update gracefully.
# For subsequent deployments: Updates the existing Lambda function.
deploy-dev:
	@$(MAKE) deploy ENV=dev

deploy-stg:
	@$(MAKE) deploy ENV=stg

deploy-prod:
	@$(MAKE) deploy ENV=prod

deploy: install build push update
	@echo "✅ Deployment (image) to $(ENV) complete!"

# Step 0: Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install --omit=dev

# Step 1: Build the Lambda container image
build: install
	@echo "🐳 Building Docker image $(IMAGE_URI)..."
	docker build --platform linux/amd64 --provenance=false -t $(IMAGE_URI) .

# Step 2: Push image to ECR
push: build
	@echo "🔐 Logging into ECR ($(AWS_REGION))..."
	@aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_REGISTRY)
	@echo "📤 Pushing Docker image $(IMAGE_URI)..."
	docker push $(IMAGE_URI)

# Step 3: Update Lambda function (only if it exists)
# This step gracefully handles the case where Lambda doesn't exist yet (first deployment)
# In that case, the image is already pushed, so Terraform can create Lambda with it
update: push
	@echo "🚀 Checking if Lambda function $(FUNCTION_NAME) exists..."
	@if aws lambda get-function --function-name $(FUNCTION_NAME) > /dev/null 2>&1; then \
		echo "✅ Lambda function exists, updating code to image $(IMAGE_URI)..."; \
		aws lambda update-function-code \
		    --function-name $(FUNCTION_NAME) \
		    --image-uri $(IMAGE_URI); \
		echo "✅ Lambda function updated successfully!"; \
	else \
		echo "⚠️  Lambda function $(FUNCTION_NAME) does not exist yet."; \
		echo "✅ Image has been pushed to ECR: $(IMAGE_URI)"; \
		echo "ℹ️  Run Terraform to create the Lambda function (it will use this image)."; \
		echo "ℹ️  After Terraform creates the function, subsequent deployments will update it automatically."; \
		exit 0; \
	fi

clean:
	@echo "🧹 Nothing to clean for image-based deploy."
