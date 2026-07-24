# Stage 1: Build ứng dụng React Vite
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package.json 
COPY package.json ./
# Cài tất cả dependencies bao gồm devDependencies (vite, plugin-react...)
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve bằng Nginx (chỉ chứa file static, ~20MB)
FROM nginx:alpine AS runner

# Xóa config mặc định của nginx
RUN rm /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
