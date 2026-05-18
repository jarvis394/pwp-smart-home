FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn nx run database:build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

# Since running migrations via Drizzle requires development tools 
# like nx, typescript, we copy the complete node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs/database ./libs/database
COPY --from=builder /app/dist/libs/database ./dist/libs/database
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/nx.json ./
COPY --from=builder /app/tsconfig.base.json ./
COPY --from=builder /app/.env ./

CMD ["yarn", "db:migrate"]
