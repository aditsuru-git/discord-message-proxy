import { io } from "socket.io-client";
import { store } from "../store";
import {
	addMessage,
	removeMessage,
	updateMessage,
	addReactionToMessage,
	removeReactionFromMessage,
} from "../store/features/messagesSlice";

const URL = import.meta.env.REACT_APP_SOCKET_URL || "http://localhost:3000";

export const socket = io(URL, {
	autoConnect: false,
});

export function initSocket() {
	if (socket.connected) return;

	socket.connect();

	socket.on("connect", () => {
		console.log("Socket connected:", socket.id);
	});

	socket.on("disconnect", () => {
		console.log("Socket disconnected");
	});

	// Listen for real-time updates and dispatch actions
	socket.on("newMessage", (message) => {
		store.dispatch(addMessage(message));
	});

	socket.on("messageUpdated", (payload) => {
		store.dispatch(updateMessage(payload));
	});

	socket.on("messageDeleted", (payload) => {
		store.dispatch(removeMessage({ id: payload.id }));
	});

	socket.on("reactionAdded", (payload) => {
		store.dispatch(addReactionToMessage(payload));
	});

	socket.on("reactionRemoved", (payload) => {
		store.dispatch(removeReactionFromMessage(payload));
	});
}
