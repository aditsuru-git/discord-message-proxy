import http from "http";
import app from "@/app";
import { Server } from "socket.io";
import {
  createBot,
  connectBotToSocket,
  setupDashboardHandlers,
} from "@/discord-api/client";
import config from "@/config";

const httpServer = http.createServer(app);

// Create the Discord bot client
const client = createBot();
if (!config.discordBotToken) {
  console.error(
    "CRITICAL ERROR: Discord bot token not found in environment variables. Please set DISCORD_BOT_TOKEN.",
  );
  process.exit(1);
}
client.login(config.discordBotToken);

// Initialize Socket.IO server
const io = new Server(httpServer, {
  cors:
    config.nodeEnv === "development"
      ? { origin: config.frontendUrl, methods: ["GET", "POST"] }
      : undefined,
});

// Connect the bot to Socket.IO and set up handlers
connectBotToSocket(client, io);
setupDashboardHandlers(client, io);

httpServer.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
