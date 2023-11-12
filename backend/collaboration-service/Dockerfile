# Stage 1: Build environment
FROM node:alpine AS build
WORKDIR /app

# Copy the source code and install dependencies
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npm run build

# Stage 2: Production environment
FROM node:alpine
WORKDIR /app

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

ARG LOG_LEVEL=info
ENV LOG_LEVEL=$LOG_LEVEL

ARG CORS_ALLOWED_ORIGINS=http://localhost:3000
ENV CORS_ALLOWED_ORIGINS=$CORS_ALLOWED_ORIGINS

ARG PORT=5300
ENV SERVICE_PORT=$PORT

# Defing service specific arguments
ARG EVENT_BUS_CONTAINER_NAME=${EVENT_BUS_CONTAINER_NAME}/
ENV EVENT_BUS_CONTAINER_NAME=$EVENT_BUS_CONTAINER_NAME

# For aws deployment
ARG REDIS_URL=${REDIS_URL}
ENV REDIS_URL=$REDIS_URL

# Copy only the production artifacts from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

RUN npm install --omit=dev

# Expose the application's port
EXPOSE $PORT

CMD ["node", "dist/app.js"]