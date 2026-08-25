# Stage 1: Base Dependencies
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Stage 2: Development Container (Vite Dev Server + HMR)
FROM base AS development

COPY . .
EXPOSE 80

CMD ["npm", "run", "dev:docker"]

# Stage 3: Build Frontend React App
FROM base AS builder

COPY . .
RUN npm run build

# Stage 4: Serve Production Static Assets with Nginx
FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

