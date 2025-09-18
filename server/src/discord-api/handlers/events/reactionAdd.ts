import {
  Client,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";
import { Server } from "socket.io";

export const handleReactionAdd = (io: Server, client: Client) => {
  return async (
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
  ) => {
    try {
      if (reaction.partial) {
        await reaction.fetch();
      }
      if (user.partial) {
        await user.fetch();
      }

      io.emit("reactionAdded", {
        messageId: reaction.message.id,
        channelId: reaction.message.channel.id,
        guildId: reaction.message.guild?.id || null,
        emoji: {
          id: reaction.emoji.id,
          name: reaction.emoji.name,
          animated: reaction.emoji.animated || false,
          url: reaction.emoji.url || null,
          unicode: reaction.emoji.id ? null : reaction.emoji.name,
        },
        user: {
          id: user.id,
          tag: user.tag,
          avatar: user.avatarURL({ size: 32 }) || user.defaultAvatarURL,
          isBot: user.bot,
        },
        count: reaction.count,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error processing messageReactionAdd event:", error);
    }
  };
};
