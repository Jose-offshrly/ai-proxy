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

# Deploy the Lambda function (builds, uploads to S3, and updates Lambda if it exists)
# For initial setup: Run this before Terraform. It will upload to S3 and skip Lambda update gracefully.
# For subsequent deployments: Updates the existing Lambda function.
deploy-dev:
	@$(MAKE) deploy ENV=dev

deploy-stg:
	@$(MAKE) deploy ENV=stg

deploy-prod:
	@$(MAKE) deploy ENV=prod

deploy: install zip upload update
	@echo "✅ Deployment to $(ENV) complete!"

# Step 0: Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install --omit=dev

# Step 1: Zip the Lambda function
zip: install
	@echo "📦 Zipping Lambda function..."
	zip -r $(ZIP_FILE) *.mjs package.json node_modules/

# Step 2: Upload to S3
upload: zip
	@echo "📤 Uploading to S3..."
	aws s3 cp $(ZIP_FILE) s3://$(BUCKET_NAME)/

# Step 3: Update Lambda function (only if it exists)
# This step gracefully handles the case where Lambda doesn't exist yet (first deployment)
# In that case, the S3 file is already uploaded, so Terraform can create Lambda with it
update: upload
	@echo "🚀 Checking if Lambda function $(FUNCTION_NAME) exists..."
	@if aws lambda get-function --function-name $(FUNCTION_NAME) > /dev/null 2>&1; then \
		echo "✅ Lambda function exists, updating code..."; \
		aws lambda update-function-code \
		    --function-name $(FUNCTION_NAME) \
		    --s3-bucket $(BUCKET_NAME) \
		    --s3-key $(ZIP_FILE); \
		echo "✅ Lambda function updated successfully!"; \
	else \
		echo "⚠️  Lambda function $(FUNCTION_NAME) does not exist yet."; \
		echo "✅ Code has been uploaded to S3: s3://$(BUCKET_NAME)/$(ZIP_FILE)"; \
		echo "ℹ️  Run Terraform to create the Lambda function (it will use the S3 file that's already there)."; \
		echo "ℹ️  After Terraform creates the function, subsequent deployments will update it automatically."; \
		exit 0; \
	fi

# Clean up the ZIP file
clean:
	@echo "🧹 Cleaning up..."
	rm -f $(ZIP_FILE)
