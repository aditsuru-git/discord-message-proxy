# Stage 1: Frontend Build
FROM node:18-alpine AS frontend-builder
WORKDIR /usr/src/app

# Copy only the package files first to leverage Docker layer caching.
COPY client/package*.json ./client/

# Install the dependencies for the client.
RUN npm install --prefix client

# Copy the rest of the client's source code.
COPY client/ ./client/

# Run the build command for the client. This will create the 'dist' folder.
RUN npm run build --prefix client

# Stage 2: Backend Build
FROM node:18-alpine AS backend-builder
WORKDIR /usr/src/app

# Copy the server's package files and install dependencies.
COPY server/package*.json ./server/
RUN npm install --prefix server

# Copy the rest of the server's source code.
COPY server/ ./server/

# Run the TypeScript build command. This will create the 'dist' folder.
RUN npm run build --prefix server

# Stage 3: Final Production Image
FROM node:18-alpine
WORKDIR /usr/src/app

# Only copy the server's package.json to install production dependencies.
COPY server/package.json ./server/
RUN npm install --prefix server --omit=dev

# Copy the final build artifacts from the previous stages.
# The `public` directory is created inside the server's `dist` folder.
COPY --from=frontend-builder /usr/src/app/client/dist ./server/dist/public

# The backend's transpiled JavaScript code.
COPY --from=backend-builder /usr/src/app/server/dist ./server/dist

# Expose the port the Express app is running on.
EXPOSE 3000

# The command to start the application.
# It runs the compiled 'server.js' file from the 'dist' folder.
CMD [ "node", "server/dist/server.js" ]



http://googleusercontent.com/immersive_entry_chip/0
By placing these files at the root, you can now run `docker-compose up --build` from your main project directory, and everything will be built and run correctly.