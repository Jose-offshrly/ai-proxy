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

# Step 3: Update Lambda function (only if it exists)
# This step gracefully handles the case where Lambda doesn't exist yet (first deployment)
# In that case, the S3 file is already uploaded, so Terraform can create Lambda with it
update: upload
	@echo "🚀 Checking if Lambda function $(FUNCTION_NAME) exists..."
	@echo "   Region: $${AWS_REGION:-not set}"
	@echo "   Function name: $(FUNCTION_NAME)"
	@echo "   AWS User: $$(aws sts get-caller-identity --query 'Arn' --output text 2>/dev/null || echo 'unknown')"
	@echo "   Listing all scout-ai-proxy functions in current region..."
	@aws lambda list-functions --no-cli-pager --query 'Functions[?contains(FunctionName, `scout-ai-proxy`)].FunctionName' --output table 2>/dev/null | grep -v "FunctionName" | grep "scout-ai-proxy" || echo "   (Could not list functions - check AWS credentials)"
	@ERROR_OUTPUT=$$(aws lambda get-function --no-cli-pager --function-name $(FUNCTION_NAME) --query 'Configuration.FunctionName' --output text 2>&1); \
	EXIT_CODE=$$?; \
	if [ $$EXIT_CODE -eq 0 ] && [ -n "$$ERROR_OUTPUT" ] && [ "$$ERROR_OUTPUT" != "None" ]; then \
		echo "✅ Lambda function exists, updating code..."; \
		aws lambda update-function-code --no-cli-pager \
		    --function-name $(FUNCTION_NAME) \
		    --s3-bucket $(BUCKET_NAME) \
		    --s3-key $(ZIP_FILE) > /dev/null 2>&1; \
		echo "✅ Lambda function updated successfully!"; \
	else \
		ERROR_TYPE=$$(echo "$$ERROR_OUTPUT" | grep -oE '(ResourceNotFoundException|AccessDeniedException|UnauthorizedOperation|InvalidParameterValueException)' || echo "Unknown"); \
		if echo "$$ERROR_OUTPUT" | grep -qE '(AccessDenied|Unauthorized|denied|permission)'; then \
			echo "⚠️  Permission denied: Cannot access Lambda function $(FUNCTION_NAME)"; \
			echo "   Error type: $$ERROR_TYPE"; \
			echo "   The AWS credentials do not have permission to access Lambda functions."; \
			echo "   Required permissions: lambda:GetFunction, lambda:UpdateFunctionCode, lambda:ListFunctions"; \
			echo ""; \
			echo "   AWS User: $$(aws sts get-caller-identity --query 'Arn' --output text 2>/dev/null || echo 'unknown')"; \
			echo ""; \
			echo "✅ Code has been uploaded to S3: s3://$(BUCKET_NAME)/$(ZIP_FILE)"; \
			echo "ℹ️  To fix:"; \
			echo "   - Verify AWS credentials have lambda:GetFunction permission"; \
			echo "   - Verify AWS credentials have lambda:UpdateFunctionCode permission"; \
			echo "   - Check IAM policy attached to the credentials"; \
		elif echo "$$ERROR_OUTPUT" | grep -qE '(ResourceNotFound|not found)'; then \
			echo "⚠️  Lambda function $(FUNCTION_NAME) does not exist."; \
			echo "   Error type: $$ERROR_TYPE"; \
			echo ""; \
			echo "✅ Code has been uploaded to S3: s3://$(BUCKET_NAME)/$(ZIP_FILE)"; \
			echo "ℹ️  To fix:"; \
			echo "   - Check if function name matches one of the functions listed above"; \
			echo "   - Verify AWS_REGION environment variable is set correctly"; \
			echo "   - Run Terraform to create the Lambda function"; \
		else \
			echo "⚠️  Lambda function $(FUNCTION_NAME) - error occurred."; \
			echo "   Error type: $$ERROR_TYPE"; \
			echo "   Error message: $$(echo "$$ERROR_OUTPUT" | sed -n 's/.*"message": "\([^"]*\)".*/\1/p' | head -1 || echo "Check AWS credentials and permissions")"; \
			echo ""; \
			echo "✅ Code has been uploaded to S3: s3://$(BUCKET_NAME)/$(ZIP_FILE)"; \
			echo "ℹ️  Troubleshooting:"; \
			echo "   - Check if function name matches one of the functions listed above"; \
			echo "   - Verify AWS_REGION environment variable is set correctly"; \
			echo "   - Verify AWS credentials have lambda:GetFunction permission"; \
		fi; \
		exit 0; \
	fi

# Clean up the ZIP file
clean:
	@echo "🧹 Cleaning up..."
	rm -f $(ZIP_FILE)
