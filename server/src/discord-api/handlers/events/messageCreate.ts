import { Message } from "discord.js";
import { Server } from "socket.io";

// Message creation event handler
export const handleMessageCreate = (io: Server) => {
  return async (message: Message) => {
    try {
      let replyTo = null;
      if (message.reference && message.reference.messageId) {
        try {
          const referencedMessage = await message.fetchReference();
          replyTo = {
            id: message.reference.messageId,
            content: referencedMessage.content,
            author: referencedMessage.author.tag,
            authorId: referencedMessage.author.id,
            preview:
              referencedMessage.content.length > 100
                ? referencedMessage.content.substring(0, 100) + "..."
                : referencedMessage.content,
          };
        } catch (error) {
          console.warn(
            `Could not fetch referenced message ${message.reference.messageId}:`,
            error,
          );
          replyTo = {
            id: message.reference.messageId,
            content: "[Message could not be loaded]",
            author: "Unknown",
            authorId: null,
            preview: "[Message could not be loaded]",
          };
        }
      }

      io.emit("newMessage", {
        content: message.content,
        author: message.author.tag,
        authorId: message.author.id,
        avatar:
          message.author.avatarURL({ size: 64 }) ||
          message.author.defaultAvatarURL,
        timestamp: message.createdTimestamp,
        channelId: message.channel.id,
        guildId: message.guild?.id || null,
        isBot: message.author.bot,
        attachments: message.attachments.map((attachment) => ({
          id: attachment.id,
          name: attachment.name,
          url: attachment.url,
          contentType: attachment.contentType,
          size: attachment.size,
          spoiler: attachment.spoiler,
        })),
        embeds:
          message.embeds.length > 0
            ? message.embeds.map((embed) => ({
                title: embed.title,
                description: embed.description,
                url: embed.url,
                color: embed.color,
                thumbnail: embed.thumbnail?.url || null,
                image: embed.image?.url || null,
                author: embed.author
                  ? {
                      name: embed.author.name,
                      iconURL: embed.author.iconURL,
                      url: embed.author.url,
                    }
                  : null,
              }))
            : [],
        replyTo,
        id: message.id,
        editedTimestamp: message.editedTimestamp,
        isPinned: message.pinned,
        mentions: {
          users: message.mentions.users.map((user) => ({
            id: user.id,
            tag: user.tag,
          })),
          roles: message.mentions.roles.map((role) => ({
            id: role.id,
            name: role.name,
          })),
          everyone: message.mentions.everyone,
        },
        reactions: message.reactions.cache.map((reaction) => ({
          emoji: {
            id: reaction.emoji.id,
            name: reaction.emoji.name,
            animated: reaction.emoji.animated || false,
          },
          count: reaction.count,
        })),
      });
    } catch (error) {
      console.error("Error processing messageCreate event:", error);

      io.emit("newMessage", {
        content: message.content || "[Error loading message content]",
        author: message.author?.tag || "Unknown",
        authorId: message.author?.id || null,
        avatar: message.author?.defaultAvatarURL || null,
        timestamp: message.createdTimestamp || Date.now(),
        channelId: message.channel.id,
        guildId: message.guild?.id || null,
        isBot: message.author?.bot || false,
        attachments: [],
        embeds: [],
        replyTo: null,
        id: message.id,
        editedTimestamp: null,
        isPinned: false,
        mentions: { users: [], roles: [], everyone: false },
        reactions: [],
      });
    }
  };
};
