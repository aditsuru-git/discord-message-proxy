import { Client, TextChannel } from "discord.js";
import { Socket } from "socket.io";

// A type representing the payload for the `deleteMessage` event.
interface DeleteMessagePayload {
  channelId: string;
  messageId: string;
}

export const handleDeleteMessage = (client: Client) => {
  return async (socket: Socket, payload: DeleteMessagePayload) => {
    try {
      const { channelId, messageId } = payload;
      const channel = client.channels.cache.get(channelId);

      if (!channel || !(channel instanceof TextChannel)) {
        console.error(
          `Channel with ID ${channelId} not found or is not a text channel.`,
        );
        socket.emit(
          "deleteMessageError",
          "Channel not found or is not a text channel.",
        );
        return;
      }

      const message = await channel.messages.fetch(messageId);
      if (!message) {
        console.error(`Message with ID ${messageId} not found.`);
        socket.emit("deleteMessageError", "Message not found.");
        return;
      }

      if (message.author.id !== client.user?.id) {
        socket.emit(
          "deleteMessageError",
          "You can only delete messages sent by this bot.",
        );
        return;
      }

      await message.delete();
    } catch (error) {
      console.error("Failed to delete message:", error);
      socket.emit("deleteMessageError", "Failed to delete message.");
    }
  };
};
