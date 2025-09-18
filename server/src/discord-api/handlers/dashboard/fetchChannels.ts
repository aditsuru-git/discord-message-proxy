import { Client, TextChannel } from "discord.js";
import { Socket } from "socket.io";

export interface SimpleChannel {
  id: string;
  name: string;
}

interface FetchChannelsPayload {
  guildId: string;
}

export const handleFetchChannels = (client: Client) => {
  return (socket: Socket, payload: FetchChannelsPayload) => {
    try {
      const { guildId } = payload;
      const guild = client.guilds.cache.get(guildId);

      if (!guild) {
        console.error(`Guild with ID ${guildId} not found.`);
        socket.emit("channelsFetchedError", "Guild not found.");
        return;
      }

      const channels = guild.channels.cache.filter(
        (channel): channel is TextChannel => channel instanceof TextChannel,
      );

      const formattedChannels: SimpleChannel[] = channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
      }));

      socket.emit("channelsFetched", formattedChannels);
    } catch (error) {
      console.error("Failed to fetch channels:", error);
      socket.emit("channelsFetchedError", "Failed to fetch channels.");
    }
  };
};
