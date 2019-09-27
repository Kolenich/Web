FROM node:alpine AS build

LABEL maintainer="nick.zhigalin@gmail.com"

EXPOSE 80 443

WORKDIR /app

COPY package.json yarn.lock /app/

RUN yarn install

COPY . /app

RUN yarn build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx/config.nginx /etc/nginx/conf.d/default.conf
