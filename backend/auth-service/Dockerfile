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

ARG PORT=5050
ENV PORT=$PORT

# Defing service specific arguments
ARG JWT_SECRET
ENV JWT_SECRET=$JWT_SECRET

ARG EMAIL_VERIFICATION_SECRET
ENV EMAIL_VERIFICATION_SECRET=$EMAIL_VERIFICATION_SECRET

ARG EMAIL_RESET_SECRET
ENV EMAIL_RESET_SECRET=$EMAIL_RESET_SECRET

ARG NM_MAIL
ENV NM_MAIL=$NM_MAIL

ARG NM_PASS
ENV NM_PASS=$NM_PASS

ARG CLOUD_URL
ENV CLOUD_URL=$CLOUD_URL

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

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