FROM node:20-alpine

RUN apk update && apk add --no-cache openssl

WORKDIR /app

COPY ../../package.json ../../yarn.lock ./

RUN yarn install --frozen-lockfile

COPY ../../.env ./

COPY . .

CMD ["yarn", "nx", "run", "backend:serve"]