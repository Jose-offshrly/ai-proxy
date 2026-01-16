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

# Show current AWS identity (useful for debugging)
show-aws-identity:
	@echo "🔍 Current AWS Identity:"
	@aws sts get-caller-identity --output json 2>/dev/null | jq -r '"   User: " + .Arn + "\n   ID: " + .UserId' || echo "   (Could not get identity - check AWS credentials)"

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

# Step 3: Update Lambda function code
update: upload
	@echo "🚀 Updating Lambda function code..."
	@echo "   Region: $${AWS_REGION:-not set}"
	@echo "   Function name: $(FUNCTION_NAME)"
	@echo "   AWS User: $$(aws sts get-caller-identity --query 'Arn' --output text 2>/dev/null || echo 'unknown')"
	@UPDATE_OUTPUT=$$(aws lambda update-function-code --no-cli-pager \
	    --function-name $(FUNCTION_NAME) \
	    --s3-bucket $(BUCKET_NAME) \
	    --s3-key $(ZIP_FILE) \
	    --query '[FunctionName, LastUpdateStatus, CodeSize, LastModified, Runtime, Handler]' \
	    --output json 2>&1); \
	UPDATE_EXIT=$$?; \
	if [ $$UPDATE_EXIT -eq 0 ]; then \
		echo "✅ Lambda function updated successfully!"; \
		echo "   Status: $$(echo "$$UPDATE_OUTPUT" | jq -r '.[1]' 2>/dev/null || echo 'Updated')"; \
		echo "   Code size: $$(echo "$$UPDATE_OUTPUT" | jq -r '.[2]' 2>/dev/null || echo 'N/A') bytes"; \
		echo "   Runtime: $$(echo "$$UPDATE_OUTPUT" | jq -r '.[4]' 2>/dev/null || echo 'N/A')"; \
		aws lambda get-function-url-config --function-name $(FUNCTION_NAME) --query 'FunctionUrl' --output text 2>/dev/null | xargs -I {} echo "   URL: {}" || echo ""; \
	else \
		ERROR_TYPE=$$(echo "$$UPDATE_OUTPUT" | grep -oE '(ResourceNotFoundException|AccessDeniedException|UnauthorizedOperation|InvalidParameterValueException|InvalidParameterValueException)' || echo "Unknown"); \
		if echo "$$UPDATE_OUTPUT" | grep -qE '(AccessDenied|Unauthorized|denied|permission)'; then \
			echo "❌ Permission denied: Cannot update Lambda function $(FUNCTION_NAME)"; \
			echo "   Error type: $$ERROR_TYPE"; \
			echo "   Required permissions: lambda:UpdateFunctionCode"; \
		elif echo "$$UPDATE_OUTPUT" | grep -qE '(ResourceNotFound|not found)'; then \
			echo "❌ Lambda function $(FUNCTION_NAME) does not exist."; \
			echo "   Error type: $$ERROR_TYPE"; \
			echo "   Run Terraform to create the Lambda function first."; \
		else \
			echo "❌ Failed to update Lambda function code"; \
			echo "   Error type: $$ERROR_TYPE"; \
			echo "   Error: $$(echo "$$UPDATE_OUTPUT" | sed -n 's/.*"message": "\([^"]*\)".*/\1/p' | head -1 || echo "$$UPDATE_OUTPUT" | head -1)"; \
		fi; \
		echo ""; \
		echo "✅ Code has been uploaded to S3: s3://$(BUCKET_NAME)/$(ZIP_FILE)"; \
		exit 1; \
	fi

# Clean up the ZIP file
clean:
	@echo "🧹 Cleaning up..."
	rm -f $(ZIP_FILE)
