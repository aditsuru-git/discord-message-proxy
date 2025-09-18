# Stage 1: Frontend Build
FROM node:18-alpine AS frontend-builder
WORKDIR /usr/src/app

COPY client/package*.json ./client/

RUN npm install --prefix client

COPY client/ ./client/

RUN npm run build --prefix client

# Stage 2: Backend Build
FROM node:18-alpine AS backend-builder
WORKDIR /usr/src/app

COPY server/package*.json ./server/
RUN npm install --prefix server

COPY server/ ./server/

RUN npm run build --prefix server

# Stage 3: Final Production Image
FROM node:18-alpine
WORKDIR /usr/src/app

COPY server/package.json ./server/
RUN npm install --prefix server --omit=dev

COPY --from=frontend-builder /usr/src/app/client/dist ./server/dist/public

COPY --from=backend-builder /usr/src/app/server/dist ./server/dist

EXPOSE 3000

CMD [ "node", "server/dist/index.js" ]

