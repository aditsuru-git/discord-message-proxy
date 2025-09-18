import { Client, TextChannel } from "discord.js";
import { Socket } from "socket.io";

// A type representing the payload for the `removeReaction` event.
interface RemoveReactionPayload {
  channelId: string;
  messageId: string;
  emoji: string;
}

export const handleRemoveReaction = (client: Client) => {
  return async (socket: Socket, payload: RemoveReactionPayload) => {
    try {
      const { channelId, messageId, emoji } = payload;
      const channel = client.channels.cache.get(channelId);

      if (!channel || !(channel instanceof TextChannel)) {
        console.error(
          `Channel with ID ${channelId} not found or is not a text channel.`,
        );
        socket.emit(
          "removeReactionError",
          "Channel not found or is not a text channel.",
        );
        return;
      }

      const message = await channel.messages.fetch(messageId);
      if (!message) {
        console.error(`Message with ID ${messageId} not found.`);
        socket.emit("removeReactionError", "Message not found.");
        return;
      }

      const reaction = message.reactions.cache.get(emoji);
      if (reaction) {
        const botReacted = reaction.users.cache.has(client.user?.id!);
        if (botReacted) {
          await reaction.users.remove(client.user?.id);
        } else {
          socket.emit(
            "removeReactionError",
            "This bot has not reacted with this emoji.",
          );
        }
      } else {
        socket.emit(
          "removeReactionError",
          "Reaction not found on the message.",
        );
      }
    } catch (error) {
      console.error("Failed to remove reaction:", error);
      socket.emit("removeReactionError", "Failed to remove reaction.");
    }
  };
};
