# 基于 node:18 构建前端静态资源
FROM node:18 AS build-stage
WORKDIR /app
COPY . .
# RUN npm install && npm run build:prod
RUN npm install && npm run build:test

# 用 nginx 作为生产环境服务器
FROM nginx:alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
