import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { socket } from "../../api/socket";
import { type RootState } from "../index";

interface SimpleChannel {
	id: string;
	name: string;
}

interface ChannelsState {
	channels: SimpleChannel[];
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
}

const initialState: ChannelsState = {
	channels: [],
	status: "idle",
	error: null,
};

export const fetchChannels = createAsyncThunk("channels/fetchChannels", async (guildId: string) => {
	return new Promise<SimpleChannel[]>((resolve, reject) => {
		socket.emit("fetchChannels", { guildId });

		socket.on("channelsFetched", (channels: SimpleChannel[]) => {
			resolve(channels);
		});

		socket.on("channelsFetchedError", (error: string) => {
			reject(error);
		});
	});
});

const channelsSlice = createSlice({
	name: "channels",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchChannels.pending, (state) => {
				state.status = "loading";
				state.channels = [];
			})
			.addCase(fetchChannels.fulfilled, (state, action: PayloadAction<SimpleChannel[]>) => {
				state.status = "succeeded";
				state.channels = action.payload;
			})
			.addCase(fetchChannels.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message || "Failed to fetch channels";
			});
	},
});

export const selectAllChannels = (state: RootState) => state.channels.channels;
export const selectChannelsStatus = (state: RootState) => state.channels.status;

export default channelsSlice.reducer;
