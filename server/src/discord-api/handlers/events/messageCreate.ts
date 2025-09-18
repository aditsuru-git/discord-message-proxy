import { Message } from "discord.js";
import { Server } from "socket.io";

export const handleMessageCreate = (io: Server) => {
  return async (message: Message) => {
    try {
      let replyTo = null;
      if (message.reference && message.reference.messageId) {
        try {
          const referencedMessage = await message.fetchReference();
          replyTo = {
            id: referencedMessage.id,
            content: referencedMessage.content,
            author: {
              id: referencedMessage.author.id,
              username: referencedMessage.author.username,
              avatar: referencedMessage.author.avatarURL({ size: 64 }),
            },
          };
        } catch (error) {
          console.warn(
            `Could not fetch referenced message ${message.reference.messageId}:`,
            error,
          );
        }
      }

      io.emit("newMessage", {
        id: message.id,
        content: message.content,
        author: {
          id: message.author.id,
          username: message.author.username,
          discriminator: message.author.discriminator,
          avatar: message.author.avatarURL({ size: 64 }),
        },
        timestamp: message.createdTimestamp,
        editedTimestamp: message.editedTimestamp,
        channelId: message.channel.id,
        attachments: message.attachments.map((attachment) => ({
          url: attachment.url,
          name: attachment.name || "",
          size: attachment.size,
        })),
        reactions: message.reactions.cache.map((reaction) => ({
          emoji: reaction.emoji.name || "",
          count: reaction.count,
          botReacted: reaction.users.cache.has(message.client.user!.id),
          users: reaction.users.cache.map((u) => u.id),
        })),
        replyTo,
      });
    } catch (error) {
      console.error("Error processing messageCreate event:", error);
    }
  };
};
