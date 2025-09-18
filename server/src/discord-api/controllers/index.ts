import { handleAddReaction } from "@/discord-api/controllers/addReaction";
import { handleReplyMessage } from "@/discord-api/controllers/replyMessage";
import { handleSendMessage } from "@/discord-api/controllers/sendMessage";

export const controllers = {
  handleAddReaction,
  handleReplyMessage,
  handleSendMessage,
};
