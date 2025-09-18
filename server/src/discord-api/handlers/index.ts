import { handleFetchChannels } from "@/discord-api/handlers/dashboard/fetchChannels";
import { handleFetchMessages } from "@/discord-api/handlers/dashboard/fetchMessages";
import { handleMessageCreate } from "@/discord-api/handlers/events/messageCreate";
import { handleMessageDelete } from "@/discord-api/handlers/events/messageDelete";
import { handleMessageUpdate } from "@/discord-api/handlers/events/messageUpdate";
import { handleReactionAdd } from "@/discord-api/handlers/events/reactionAdd";
import { handleReactionRemove } from "@/discord-api/handlers/events/reactionRemove";
import { handleReactionRemoveAll } from "@/discord-api/handlers/events/reactionRemoveAll";
import { handleFetchGuilds } from "@/discord-api/handlers/dashboard/fetchGuilds";

export const handlers = {
  handleMessageCreate,
  handleMessageDelete,
  handleMessageUpdate,
  handleReactionAdd,
  handleReactionRemove,
  handleReactionRemoveAll,
  handleFetchMessages,
  handleFetchChannels,
  handleFetchGuilds,
};
