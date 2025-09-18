import { Client, TextChannel } from "discord.js";
import { Socket } from "socket.io";

// A type representing the payload for the `addReaction` event.
interface AddReactionPayload {
  channelId: string;
  messageId: string;
  emoji: string;
}

export const handleAddReaction = (client: Client) => {
  return async (socket: Socket, payload: AddReactionPayload) => {
    try {
      const { channelId, messageId, emoji } = payload;
      const channel = client.channels.cache.get(channelId);

      if (!channel || !(channel instanceof TextChannel)) {
        console.error(
          `Channel with ID ${channelId} not found or is not a text channel.`,
        );
        socket.emit(
          "addReactionError",
          "Channel not found or is not a text channel.",
        );
        return;
      }

      const message = await channel.messages.fetch(messageId);
      if (!message) {
        console.error(`Message with ID ${messageId} not found.`);
        socket.emit("addReactionError", "Message not found.");
        return;
      }

      await message.react(emoji);
    } catch (error) {
      console.error("Failed to add reaction:", error);
      socket.emit("addReactionError", "Failed to add reaction.");
    }
  };
};
