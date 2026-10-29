# =========================================================
# ETAPA 1: BUILD DO FRONTEND (React/Vite)
# =========================================================
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
# A URL da API será relativa (/api), o Nginx resolve isso depois
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# =========================================================
# ETAPA 2: BUILD DO BACKEND (Spring Boot)
# =========================================================
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# =========================================================
# ETAPA 3: IMAGEM FINAL (Nginx + Java)
# =========================================================
FROM eclipse-temurin:17-jre-alpine

# Instala o Nginx
RUN apk add --no-cache nginx

# Copia o frontend compilado para a pasta do Nginx
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copia o backend (JAR) para a raiz do container
COPY --from=backend-build /app/backend/target/*.jar /app/backend.jar

# Copia a configuração do Nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# Cria a pasta de uploads com permissão
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Script que liga o Java em background e o Nginx na frente
RUN printf '#!/bin/sh\njava -jar /app/backend.jar &\nnginx -g "daemon off;"\n' > /app/start.sh && chmod +x /app/start.sh

# Expõe apenas a porta 80 (do Nginx)
EXPOSE 80

CMD ["/app/start.sh"]