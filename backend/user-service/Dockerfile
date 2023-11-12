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

# Defing service arguments
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

ARG LOG_LEVEL=info
ENV LOG_LEVEL=$LOG_LEVEL

ARG CORS_ALLOWED_ORIGINS=http://localhost:3000
ENV CORS_ALLOWED_ORIGINS=$CORS_ALLOWED_ORIGINS

ENV AUTH_ENDPOINT="auth/api/validate"
ENV AUTH_ADMIN_ENDPOINT="auth/api/validateAdmin"

ARG PORT=5005
ENV PORT=$PORT

# Defing service specific arguments
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ARG EMAIL_VERIFICATION_SECRET
ENV EMAIL_VERIFICATION_SECRET=$EMAIL_VERIFICATION_SECRET

# Copy only the production artifacts from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/src/models/prisma/ ./src/models/prisma/
RUN npm install --omit=dev
RUN npx prisma generate

# Expose the application's port
EXPOSE $PORT

# Run image
CMD ["node", "dist/app.js"]