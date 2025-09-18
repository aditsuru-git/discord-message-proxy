import { Client, TextChannel } from "discord.js";
import { Socket } from "socket.io";

// A type representing a simplified channel object for data transfer.
export interface SimpleChannel {
  id: string;
  name: string;
}

export const handleFetchChannels = (client: Client) => {
  return (socket: Socket) => {
    try {
      // Filter the client's cached channels to find only TextChannels.
      const channels = client.channels.cache.filter(
        (channel): channel is TextChannel => channel instanceof TextChannel,
      );

      // Map the channels to our simplified SimpleChannel format.
      const formattedChannels: SimpleChannel[] = channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
      }));

      // Emit the formatted channels back to the client.
      socket.emit("channelsFetched", formattedChannels);
    } catch (error) {
      console.error("Failed to fetch channels:", error);
      // Emit an error event back to the client.
      socket.emit("channelsFetchedError", "Failed to fetch channels.");
    }
  };
};
