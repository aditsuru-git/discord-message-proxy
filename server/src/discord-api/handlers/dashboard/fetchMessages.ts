import { Client, TextChannel, Message, MessageReaction } from "discord.js";
import { Socket } from "socket.io";

// A type representing a simplified reaction object with relevant data.
interface SimpleReaction {
  emoji: string;
  count: number;
}

// A type representing a simplified message object for easy data transfer.
export interface SimpleMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  };
  timestamp: number;
  editedTimestamp: number | null;
  reactions: SimpleReaction[];
  attachments: { url: string; name: string; size: number }[];
}

export const handleFetchMessages = (client: Client) => {
  return async (
    socket: Socket,
    data: {
      channelId: string;
    },
  ) => {
    try {
      // Correctly destructure channelId from the data object
      const { channelId } = data;
      const channel = client.channels.cache.get(channelId);

      // Ensure the channel exists and is a text-based channel we can fetch from.
      if (!channel || !(channel instanceof TextChannel)) {
        console.error(
          `Channel with ID ${channelId} not found or is not a text channel.`,
        );
        // Emit an error event back to the client
        socket.emit(
          "messagesFetchedError",
          "Channel not found or is not a text channel.",
        );
        return;
      }

      // Fetch the last 20 messages from the channel.
      const messages = await channel.messages.fetch({ limit: 20 });

      // Map the fetched messages to our simplified SimpleMessage format.
      const formattedMessages: SimpleMessage[] = messages
        .map((msg) => {
          // Map reactions to an array of SimpleReaction objects.
          const reactions: SimpleReaction[] = msg.reactions.cache.map(
            (reaction: MessageReaction) => ({
              emoji: reaction.emoji.name || "",
              count: reaction.count || 0,
            }),
          );

          // Map attachments to a simplified object.
          const attachments = msg.attachments.map((attachment) => ({
            url: attachment.url,
            name: attachment.name || "",
            size: attachment.size,
          }));

          return {
            id: msg.id,
            content: msg.content,
            author: {
              id: msg.author.id,
              username: msg.author.username,
              discriminator: msg.author.discriminator,
              avatar: msg.author.avatarURL({ size: 64 }),
            },
            timestamp: msg.createdTimestamp,
            editedTimestamp: msg.editedTimestamp,
            reactions,
            attachments,
          };
        })
        .reverse(); // Reverse the array to get them in chronological order.

      // Emit the formatted messages back to the client
      socket.emit("messagesFetched", formattedMessages);
    } catch (error) {
      console.error(
        `Failed to fetch messages for channel ${data.channelId}:`,
        error,
      );
      // Emit an error event back to the client
      socket.emit("messagesFetchedError", "Failed to fetch messages.");
    }
  };
};
