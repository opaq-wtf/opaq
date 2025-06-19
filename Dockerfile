# Use Bun's official image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies using Bun
RUN bun install

# Build Next.js app
RUN bun run build

# Expose port
EXPOSE 3000

# Run production server
CMD ["bun", "run", "start"]
