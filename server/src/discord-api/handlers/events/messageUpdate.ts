import { Message, PartialMessage } from "discord.js";
import { Server } from "socket.io";

// Message update event handler
export const handleMessageUpdate = (io: Server) => {
  return async (
    oldMessage: Message | PartialMessage,
    newMessage: Message | PartialMessage,
  ) => {
    try {
      if (newMessage.partial) {
        await newMessage.fetch();
      }

      io.emit("messageUpdated", {
        id: newMessage.id,
        channelId: newMessage.channel.id,
        guildId: newMessage.guild?.id || null,
        content: newMessage.content,
        editedTimestamp: newMessage.editedTimestamp,
        author: {
          id: newMessage.author?.id,
          tag: newMessage.author?.tag,
        },
      });
    } catch (error) {
      console.error("Error processing messageUpdate event:", error);
    }
  };
};
