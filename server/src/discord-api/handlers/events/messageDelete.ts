import { Message, PartialMessage } from "discord.js";
import { Server } from "socket.io";

// Message delete event handler
export const handleMessageDelete = (io: Server) => {
  return async (message: Message | PartialMessage) => {
    io.emit("messageDeleted", {
      id: message.id,
      channelId: message.channel.id,
      guildId: message.guild?.id || null,
      timestamp: Date.now(),
    });
  };
};
