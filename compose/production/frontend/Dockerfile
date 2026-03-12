# Stage 1: build React app
FROM node:18 as build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .

ARG REACT_APP_BACKEND_API
ENV REACT_APP_BACKEND_API=$REACT_APP_BACKEND_API

RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY compose/production/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
