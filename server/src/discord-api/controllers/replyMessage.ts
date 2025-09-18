import { Client, TextChannel } from "discord.js";
import { Socket } from "socket.io";

// A type representing the payload for the `replyMessage` event.
interface ReplyMessagePayload {
  channelId: string;
  messageId: string;
  content: string;
}

export const handleReplyMessage = (client: Client) => {
  return async (socket: Socket, payload: ReplyMessagePayload) => {
    try {
      const { channelId, messageId, content } = payload;
      const channel = client.channels.cache.get(channelId);

      if (!channel || !(channel instanceof TextChannel)) {
        console.error(
          `Channel with ID ${channelId} not found or is not a text channel.`,
        );
        socket.emit(
          "replyMessageError",
          "Channel not found or is not a text channel.",
        );
        return;
      }

      const messageToReplyTo = await channel.messages.fetch(messageId);
      if (!messageToReplyTo) {
        console.error(`Message with ID ${messageId} not found.`);
        socket.emit("replyMessageError", "Message not found.");
        return;
      }

      await messageToReplyTo.reply(content);
      socket.emit("messageReplied", { channelId, messageId, content });
    } catch (error) {
      console.error("Failed to reply to message:", error);
      socket.emit("replyMessageError", "Failed to reply to message.");
    }
  };
};
