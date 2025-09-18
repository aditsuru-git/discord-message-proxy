import { Message, PartialMessage } from "discord.js";
import { Server } from "socket.io";

// All reactions cleared event handler
export const handleReactionRemoveAll = (io: Server) => {
  return async (message: Message | PartialMessage) => {
    try {
      if (message.partial) {
        await message.fetch();
      }

      io.emit("reactionsCleared", {
        messageId: message.id,
        channelId: message.channel.id,
        guildId: message.guild?.id || null,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error processing messageReactionRemoveAll event:", error);
    }
  };
};
