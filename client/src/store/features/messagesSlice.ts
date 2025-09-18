import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { socket } from "../../api/socket";
import { type RootState } from "../index";

interface Author {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
}

interface Reaction {
	emoji: string;
	count: number;
	users: string[];
	botReacted: boolean;
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

interface Message {
	id: string;
	channelId: string;
	content: string;
	author: Author;
	timestamp: number;
	editedTimestamp: number | null;
	reactions: Reaction[];
	replyTo: ReplyInfo | null;
}

interface MessagesState {
	messages: Message[];
	botId: string | null;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	currentChannelId: string | null;
}

const initialState: MessagesState = {
	messages: [],
	botId: null,
	status: "idle",
	error: null,
	currentChannelId: null,
};

export const fetchMessages = createAsyncThunk("messages/fetchMessages", async (channelId: string, { dispatch }) => {
	return new Promise<{ messages: Message[]; botId: string }>((resolve, reject) => {
		socket.emit("fetchMessages", { channelId });

		socket.on("messagesFetched", (data: { messages: Message[]; botId: string }) => {
			dispatch(setBotUserId(data.botId));
			resolve(data);
		});

		socket.on("messagesFetchedError", (error: string) => {
			reject(error);
		});
	});
});

const messagesSlice = createSlice({
	name: "messages",
	initialState,
	reducers: {
		setBotUserId(state, action: PayloadAction<string>) {
			state.botId = action.payload;
		},
		addMessage(state, action: PayloadAction<Message>) {
			const incomingMessage = action.payload;

			if (incomingMessage.channelId === state.currentChannelId) {
				if (!state.messages.find((m) => m.id === incomingMessage.id)) {
					state.messages.push(incomingMessage);
				}
			}
		},
		removeMessage(state, action: PayloadAction<{ id: string }>) {
			state.messages = state.messages.filter((msg) => msg.id !== action.payload.id);
		},
		updateMessage(state, action: PayloadAction<{ id: string; content: string; editedTimestamp: number }>) {
			const message = state.messages.find((msg) => msg.id === action.payload.id);
			if (message) {
				message.content = action.payload.content;
				message.editedTimestamp = action.payload.editedTimestamp;
			}
		},
		addReactionToMessage(
			state,
			action: PayloadAction<{ messageId: string; emoji: { name: string }; user: { id: string } }>
		) {
			const { messageId, emoji, user } = action.payload;
			const message = state.messages.find((msg) => msg.id === messageId);
			if (!message) return;

			const reaction = message.reactions.find((r) => r.emoji === emoji.name);
			const isBot = user.id === state.botId;

			if (reaction) {
				if (!reaction.users.includes(user.id)) {
					reaction.count++;
					reaction.users.push(user.id);
					if (isBot) reaction.botReacted = true;
				}
			} else {
				message.reactions.push({
					emoji: emoji.name,
					count: 1,
					users: [user.id],
					botReacted: isBot,
				});
			}
		},
		removeReactionFromMessage(
			state,
			action: PayloadAction<{ messageId: string; emoji: { name: string }; user: { id: string } }>
		) {
			const { messageId, emoji, user } = action.payload;
			const message = state.messages.find((msg) => msg.id === messageId);
			if (!message) return;

			const reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji.name);
			if (reactionIndex !== -1) {
				const reaction = message.reactions[reactionIndex];
				if (reaction.users.includes(user.id)) {
					reaction.count--;
					reaction.users = reaction.users.filter((id) => id !== user.id);
					if (user.id === state.botId) {
						reaction.botReacted = false;
					}
				}
				if (reaction.count === 0) {
					message.reactions.splice(reactionIndex, 1);
				}
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchMessages.pending, (state, action) => {
				state.status = "loading";
				state.messages = [];
				state.currentChannelId = action.meta.arg;
			})
			.addCase(fetchMessages.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.messages = action.payload.messages;
				state.botId = action.payload.botId;
			})
			.addCase(fetchMessages.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message || "Failed to fetch messages";
			});
	},
});

export const {
	setBotUserId,
	addMessage,
	removeMessage,
	updateMessage,
	addReactionToMessage,
	removeReactionFromMessage,
} = messagesSlice.actions;

export const selectAllMessages = (state: RootState) => state.messages.messages;
export const selectMessagesStatus = (state: RootState) => state.messages.status;
export const selectBotId = (state: RootState) => state.messages.botId;

export default messagesSlice.reducer;
