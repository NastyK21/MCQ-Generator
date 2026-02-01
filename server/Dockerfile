# Production Dockerfile for MCQ Generator backend
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --production

# Copy app source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Use a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production
EXPOSE 3001

CMD [ "node", "index.js" ]
