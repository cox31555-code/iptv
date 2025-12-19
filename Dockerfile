FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine

# Install curl and bash for Adcash anti-adblock script
RUN apk add --no-cache curl bash

# Download and setup Adcash anti-adblock installer
RUN mkdir -p /opt/adcash && \
    curl -o /opt/adcash/anti-adblock.sh https://raw.githubusercontent.com/adcash/customer-scripts/master/linux/anti-adblock.sh && \
    chmod +x /opt/adcash/anti-adblock.sh

# Copy built frontend to nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Install Adcash anti-adblock library with random-looking filename
# --install: target file path, 5: update check interval (minutes)
RUN /opt/adcash/anti-adblock.sh --install /usr/share/nginx/html/lib-1b_48s7z.js 5

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
