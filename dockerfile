# Dockerfile
FROM node:20 AS build

WORKDIR /app

# Copia todos os arquivos do projeto
COPY . .

# Instala dependências
RUN npm ci

# Build do projeto
RUN npm run build

# Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
