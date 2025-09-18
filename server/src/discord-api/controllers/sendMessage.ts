import { Client, TextChannel } from "discord.js";
import { Socket } from "socket.io";

// A type representing the payload for the `sendMessage` event.
interface SendMessagePayload {
  channelId: string;
  content: string;
}

export const handleSendMessage = (client: Client) => {
  return async (socket: Socket, payload: SendMessagePayload) => {
    try {
      const { channelId, content } = payload;
      const channel = client.channels.cache.get(channelId);

      if (!channel || !(channel instanceof TextChannel)) {
        console.error(
          `Channel with ID ${channelId} not found or is not a text channel.`,
        );
        socket.emit(
          "sendMessageError",
          "Channel not found or is not a text channel.",
        );
        return;
      }

      await channel.send(content);
      socket.emit("messageSent", { channelId, content });
    } catch (error) {
      console.error("Failed to send message:", error);
      socket.emit("sendMessageError", "Failed to send message.");
    }
  };
};
