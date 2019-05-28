FROM node:12.2.0-alpine AS build

EXPOSE 80 443

WORKDIR /app

COPY package.json /app/

RUN npm i

COPY . /app

RUN npm run build

FROM nginx:1.15-alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx/config.nginx /etc/nginx/conf.d/default.conf
