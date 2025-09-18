import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import config from "@/config";

export const initSocket = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors:
      config.nodeEnv === "development"
        ? { origin: config.frontendUrl, methods: ["GET", "POST"] }
        : undefined,
  });

  io.on("connection", (socket) => {
    console.log("Frontend connected:", socket.id);

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};
