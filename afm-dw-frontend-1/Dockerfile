# Build image
ARG NODE_VERSION

FROM node:$NODE_VERSION-alpine as build-stage

RUN npm config set registry http://registry.npmjs.org/

RUN apk --update add python3 g++ make

WORKDIR /app

# Install dependencies
COPY *config.js *config.json package*.json ./
RUN npm ci
RUN npm install --ignore-scripts --prefer-offline

# Build
ARG APP_ENV_FILE

COPY $APP_ENV_FILE .env
COPY src src
COPY public public

RUN npm run build

# Serve image
FROM node:$NODE_VERSION-alpine

RUN npm config set registry http://registry.npmjs.org/

WORKDIR /app

# Install dependencies
RUN npm install -g serve

# Copy built files
COPY --from=build-stage /app/dist dist

CMD ["serve", "-s", "dist"]
