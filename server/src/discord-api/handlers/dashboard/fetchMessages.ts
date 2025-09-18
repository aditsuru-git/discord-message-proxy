import { Client, TextChannel, Message, MessageReaction } from "discord.js";
import { Socket } from "socket.io";

interface SimpleReaction {
  emoji: string;
  count: number;
  botReacted: boolean;
  users: string[];
}

interface ReplyInfo {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

export interface SimpleMessage {
  id: string;
  channelId: string;
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
  replyTo: ReplyInfo | null;
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
        socket.emit(
          "messagesFetchedError",
          "Channel not found or is not a text channel.",
        );
        return;
      }

      const messages = await channel.messages.fetch({ limit: 50 });

      const formattedMessages: SimpleMessage[] = await Promise.all(
        messages.map(async (msg) => {
          const reactions: SimpleReaction[] = msg.reactions.cache.map(
            (reaction: MessageReaction) => ({
              emoji: reaction.emoji.name || "",
              count: reaction.count || 0,
              botReacted: reaction.users.cache.has(client.user!.id),
              users: reaction.users.cache.map((u) => u.id),
            }),
          );

          const attachments = msg.attachments.map((attachment) => ({
            url: attachment.url,
            name: attachment.name || "",
            size: attachment.size,
          }));

          let replyTo: ReplyInfo | null = null;
          if (msg.reference && msg.reference.messageId) {
            try {
              const referencedMessage = await channel.messages.fetch(
                msg.reference.messageId,
              );
              replyTo = {
                id: referencedMessage.id,
                content: referencedMessage.content,
                author: {
                  id: referencedMessage.author.id,
                  username: referencedMessage.author.username,
                  avatar: referencedMessage.author.avatarURL({ size: 64 }),
                },
              };
            } catch {
              replyTo = null; // Message was deleted or is inaccessible
            }
          }

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
            replyTo,
            channelId: msg.channel.id,
          };
        }),
      );

      socket.emit("messagesFetched", {
        botId: client.user?.id,
        messages: formattedMessages.reverse(),
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
