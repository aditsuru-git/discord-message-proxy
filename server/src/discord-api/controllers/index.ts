import { handleAddReaction } from "@/discord-api/controllers/addReaction";
import { handleDeleteMessage } from "@/discord-api/controllers/deleteMessage";
import { handleEditMessage } from "@/discord-api/controllers/editMessage";
import { handleRemoveReaction } from "@/discord-api/controllers/removeReaction";
import { handleReplyMessage } from "@/discord-api/controllers/replyMessage";
import { handleSendMessage } from "@/discord-api/controllers/sendMessage";

export const controllers = {
  handleAddReaction,
  handleReplyMessage,
  handleSendMessage,
  handleEditMessage,
  handleDeleteMessage,
  handleRemoveReaction,
};
