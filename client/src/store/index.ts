import { configureStore } from "@reduxjs/toolkit";
import guildsReducer from "./features/guildsSlice";
import channelsReducer from "./features/channelsSlice";
import messagesReducer from "./features/messagesSlice";

export const store = configureStore({
	reducer: {
		guilds: guildsReducer,
		channels: channelsReducer,
		messages: messagesReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
