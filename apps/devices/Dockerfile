FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn nx run devices:build --prod

RUN rm -rf node_modules && yarn install --frozen-lockfile --production

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/devices ./dist
COPY --from=builder /app/.env ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./

CMD ["node", "dist/main.js"]