import { Client, TextChannel, Message, MessageReaction } from "discord.js";
import { Socket } from "socket.io";

interface SimpleReaction {
  emoji: string;
  count: number;
  botReacted: boolean;
}

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
      const { channelId } = data;
      const channel = client.channels.cache.get(channelId);

      if (!channel || !(channel instanceof TextChannel)) {
        console.error(
          `Channel with ID ${channelId} not found or is not a text channel.`,
        );
        socket.emit(
          "messagesFetchedError",
          "Channel not found or is not a text channel.",
        );
        return;
      }

      const messages = await channel.messages.fetch({ limit: 50 });

      const formattedMessages: SimpleMessage[] = messages
        .map((msg) => {
          const reactions: SimpleReaction[] = msg.reactions.cache.map(
            (reaction: MessageReaction) => ({
              emoji: reaction.emoji.name || "",
              count: reaction.count || 0,
              botReacted: reaction.users.cache.has(client.user!.id),
            }),
          );

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
        .reverse();

      socket.emit("messagesFetched", {
        botId: client.user?.id,
        messages: formattedMessages,
      });
    } catch (error) {
      console.error(
        `Failed to fetch messages for channel ${data.channelId}:`,
        error,
      );
      socket.emit("messagesFetchedError", "Failed to fetch messages.");
    }
  };
};
