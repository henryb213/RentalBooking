# Stage 1: Build the application
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency files and install packages
COPY package*.json ./
RUN npm install

# Copy the rest of application code
COPY . .

# Build the Next.js application
RUN npx next build --no-lint

# Stage 2: Production image
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./

# Install dependencies
RUN npm install

# Expose the default port
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
