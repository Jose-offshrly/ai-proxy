# Define variables
BUCKET_NAME := zunou
ZIP_FILE := scout_ai_proxy_lambda_function.zip

# Define function names per environment
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

# Build and upload to S3 only (for CI/CD or initial setup)
build-and-upload: zip upload
	@echo "✅ Build and upload to S3 complete!"

# Deploy the Lambda function (updates existing Lambda)
deploy-dev:
	@$(MAKE) deploy ENV=dev

deploy-stg:
	@$(MAKE) deploy ENV=stg

deploy-prod:
	@$(MAKE) deploy ENV=prod

deploy: zip upload update
	@echo "✅ Deployment to $(ENV) complete!"

# Step 1: Zip the Lambda function
zip:
	@echo "📦 Zipping Lambda function..."
	zip -r $(ZIP_FILE) *.mjs package.json node_modules/

# Step 2: Upload to S3
upload: zip
	@echo "📤 Uploading to S3..."
	aws s3 cp $(ZIP_FILE) s3://$(BUCKET_NAME)/

# Step 3: Update Lambda function
update: upload
	@echo "🚀 Updating Lambda function $(FUNCTION_NAME)..."
	@if ! aws lambda get-function --function-name $(FUNCTION_NAME) > /dev/null 2>&1; then \
		echo "❌ Error: Lambda function $(FUNCTION_NAME) does not exist!"; \
		echo "   Please create it first using Terraform:"; \
		echo "   cd ../../infrastructure/environment && terraform apply -var-file=terraform.staging.tfvars"; \
		exit 1; \
	fi
	aws lambda update-function-code \
	    --function-name $(FUNCTION_NAME) \
	    --s3-bucket $(BUCKET_NAME) \
	    --s3-key $(ZIP_FILE)

# Clean up the ZIP file
clean:
	@echo "🧹 Cleaning up..."
	rm -f $(ZIP_FILE)
