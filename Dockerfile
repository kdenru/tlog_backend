# Используем официальный Node.js образ
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-alpine
WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production

# Генерим Prisma Client и применяем миграции при старте
RUN npx prisma generate

CMD npx prisma migrate deploy && node dist/server.js 