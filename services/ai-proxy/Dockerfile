FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:20

# Copy package files
COPY package.json package-lock.json ${LAMBDA_TASK_ROOT}/

# Install production dependencies
RUN npm ci --omit=dev

# Copy Lambda handler and supporting modules
COPY *.mjs ${LAMBDA_TASK_ROOT}/

# Tell Lambda which handler to invoke: index.mjs -> export const handler = ...
CMD [ "index.handler" ]

