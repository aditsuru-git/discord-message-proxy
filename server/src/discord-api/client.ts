import { Client, GatewayIntentBits } from "discord.js";
import { Server } from "socket.io";
import { handlers } from "@/discord-api/handlers";
import { controllers } from "@/discord-api/controllers";

export const createBot = () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
    ],
  });

  client.on("clientReady", () => {
    console.log(`Logged in as ${client.user?.tag}!`);
  });

  return client;
};

export const connectBotToSocket = (client: Client, io: Server) => {
  // Connect all event handlers for Discord events
  client.on("messageCreate", handlers.handleMessageCreate(io));
  client.on("messageReactionAdd", handlers.handleReactionAdd(io, client));
  client.on("messageReactionRemove", handlers.handleReactionRemove(io, client));
  client.on("messageUpdate", handlers.handleMessageUpdate(io));
  client.on("messageDelete", handlers.handleMessageDelete(io));
  client.on("messageReactionRemoveAll", handlers.handleReactionRemoveAll(io));

  console.log("Discord bot events connected to Socket.IO");
};

export const setupDashboardHandlers = (client: Client, io: Server) => {
  io.on("connection", (socket) => {
    console.log("Dashboard connected:", socket.id);

    // Handle dashboard requests
    socket.on("fetchGuilds", () => handlers.handleFetchGuilds(client)(socket));
    socket.on("fetchChannels", (payload) =>
      handlers.handleFetchChannels(client)(socket, payload),
    );
    socket.on("fetchMessages", (payload) =>
      handlers.handleFetchMessages(client)(socket, payload),
    );

    // Handle frontend requests
    socket.on("addReaction", (payload) =>
      controllers.handleAddReaction(client)(socket, payload),
    );
    socket.on("removeReaction", (payload) =>
      controllers.handleRemoveReaction(client)(socket, payload),
    );
    socket.on("sendMessage", (payload) =>
      controllers.handleSendMessage(client)(socket, payload),
    );
    socket.on("replyMessage", (payload) =>
      controllers.handleReplyMessage(client)(socket, payload),
    );
    socket.on("editMessage", (payload) =>
      controllers.handleEditMessage(client)(socket, payload),
    );
    socket.on("deleteMessage", (payload) =>
      controllers.handleDeleteMessage(client)(socket, payload),
    );

    socket.on("disconnect", () => {
      console.log("Dashboard disconnected:", socket.id);
    });
  });
};
