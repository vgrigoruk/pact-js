FROM node:8 AS base

RUN mkdir -p /app && npm config set strict-ssl false
COPY ["package.json", "/app/"]
WORKDIR /app

RUN  npm install

COPY . .

FROM base AS package

RUN cd examples/e2e && npm i
WORKDIR /app/examples/e2e
CMD 'npm t'
