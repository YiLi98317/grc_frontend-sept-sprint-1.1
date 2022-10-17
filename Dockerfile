# # pull the official base image
# FROM node:alpine
# # set working direction
# WORKDIR /app
# # add `/app/node_modules/.bin` to $PATH
# ENV PATH /app/node_modules/.bin:$PATH
# # install application dependencies
# COPY package.json ./
# COPY package-lock.json ./
# RUN npm i
# # add app
# COPY . ./
# # start app
# CMD ["npm", "start"]



# # syntax=docker/dockerfile:1
# # pull the official base image
FROM node:14-alpine AS build
# set working direction
WORKDIR /app
## add `/app/node_modules/.bin` to $PATH
ENV NODE_ENV=production

# install application dependencies
# COPY package* yarn.lock ./
COPY package.json ./
COPY package-lock.json ./
RUN npm i
#copy static directories and src instead of full project
COPY public ./public
COPY src ./src

# # For development
# # Run development
# CMD ["npm", "start"]

# FOR Production
# COPY .env /usr/share/nginx/html/.env

ARG PORT=3000
ARG HTTPS=true
ARG ENCRYPT_IV=e48aff62dfd827bb79eed287ae2a5a93
ARG ENCRYPT_KEY=grcencryptkeydevgrcencryptkeydevgrcencryptkeydevgrcencryptkeydev
ARG DOMAIN=https://qa.gorico.io/
ARG API_URL=https://qa-api.gorico.io/
ARG CONNECTOR_API_URL=https://zmabevt6dv.us-east-1.awsapprunner.com/
ARG ALLOWED_ORIGIN=https://qa.gorico.io/
ARG API_KEY=1aa84a38ddb5b29260878ff28dcececa
ARG SERVER_URL=https://qa.gorico.io/api/v1/
ARG SUPPORT_UPLOAD_FILE_TYPE=doc,docx,pdf,xls,xlsx,png,gif,jpg,jpeg,jfif,svg,webp

ENV PORT=$PORT
ENV HTTPS=$HTTPS
ENV REACT_APP_ENCRYPT_IV=$ENCRYPT_IV
ENV REACT_APP_ENCRYPT_KEY=$ENCRYPT_KEY
ENV REACT_APP_DOMAIN=$DOMAIN
ENV REACT_APP_API_URL=$API_URL
ENV REACT_APP_CONNECTOR_API_URL=$CONNECTOR_API_URL
ENV REACT_APP_ALLOWED_ORIGIN=$ALLOWED_ORIGIN
ENV REACT_APP_API_KEY=$API_KEY
ENV REACT_APP_SERVER_URL=$SERVER_URL
ENV REACT_APP_SUPPORT_UPLOAD_FILE_TYPE=$SUPPORT_UPLOAD_FILE_TYPE

RUN npm run build


FROM nginx:1.23-alpine
# copy nginx config file
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html





