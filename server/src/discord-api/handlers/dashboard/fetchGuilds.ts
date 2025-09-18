import { Client } from "discord.js";
import { Socket } from "socket.io";

// A type representing a simplified guild object for data transfer.
export interface SimpleGuild {
  id: string;
  name: string;
  iconURL: string | null;
}

export const handleFetchGuilds = (client: Client) => {
  return (socket: Socket) => {
    try {
      // Get all guilds from the bot's cache.
      const guilds = client.guilds.cache;

      // Map the guilds to our simplified SimpleGuild format.
      const formattedGuilds: SimpleGuild[] = guilds.map((guild) => ({
        id: guild.id,
        name: guild.name,
        iconURL: guild.iconURL({ size: 64 }),
      }));

      // Emit the formatted guilds back to the client.
      socket.emit("guildsFetched", formattedGuilds);
    } catch (error) {
      console.error("Failed to fetch guilds:", error);
      // Emit an error event back to the client.
      socket.emit("guildsFetchedError", "Failed to fetch guilds.");
    }
  };
};
