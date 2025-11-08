# Base image
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# libc6-compat fixes compatibility with some Node.js native modules
RUN apk add --no-cache libc6-compat

# Copy dependency files
COPY package.json package-lock.json* ./

# Install exact dependencies for production builds
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app

# Copy installed deps from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build your app (e.g., TypeScript -> JS, etc.)
RUN npm run build

# Runtime stage
FROM base AS runner
WORKDIR /app

# Copy built app and node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001
ENV HOSTNAME=0.0.0.0

# Expose the port your app listens on
EXPOSE 5001

# Run your app
CMD ["node", "server.js"]
