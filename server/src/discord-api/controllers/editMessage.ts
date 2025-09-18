import { Client, TextChannel } from "discord.js";
import { Socket } from "socket.io";

// A type representing the payload for the `editMessage` event.
interface EditMessagePayload {
  channelId: string;
  messageId: string;
  content: string;
}

export const handleEditMessage = (client: Client) => {
  return async (socket: Socket, payload: EditMessagePayload) => {
    try {
      const { channelId, messageId, content } = payload;
      const channel = client.channels.cache.get(channelId);

      if (!channel || !(channel instanceof TextChannel)) {
        console.error(
          `Channel with ID ${channelId} not found or is not a text channel.`,
        );
        socket.emit(
          "editMessageError",
          "Channel not found or is not a text channel.",
        );
        return;
      }

      const message = await channel.messages.fetch(messageId);
      if (!message) {
        console.error(`Message with ID ${messageId} not found.`);
        socket.emit("editMessageError", "Message not found.");
        return;
      }

      // 📝 Problem 1 Fix: Only allow editing of messages sent by the bot.
      if (message.author.id !== client.user?.id) {
        socket.emit(
          "editMessageError",
          "You can only edit messages sent by this bot.",
        );
        return;
      }

      await message.edit(content);
    } catch (error) {
      console.error("Failed to edit message:", error);
      socket.emit("editMessageError", "Failed to edit message.");
    }
  };
};
