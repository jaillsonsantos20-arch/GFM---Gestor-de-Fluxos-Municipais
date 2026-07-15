FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json nest-cli.json ./
COPY prisma/ ./prisma/
RUN npx prisma generate
COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS run
WORKDIR /app
RUN apk add --no-cache tini
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY prisma/ ./prisma/
RUN mkdir -p /app/uploads
EXPOSE 3000
USER node
ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/src/main.js"]
