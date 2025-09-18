import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { socket } from "../../api/socket";
import { type RootState } from "../index";

interface SimpleGuild {
	id: string;
	name: string;
	iconURL: string | null;
}

interface GuildsState {
	guilds: SimpleGuild[];
	selectedGuild: string | null;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
}

const initialState: GuildsState = {
	guilds: [],
	selectedGuild: null,
	status: "idle",
	error: null,
};

export const fetchGuilds = createAsyncThunk("guilds/fetchGuilds", async (_, { dispatch }) => {
	return new Promise<SimpleGuild[]>((resolve, reject) => {
		socket.emit("fetchGuilds");

		socket.on("guildsFetched", (guilds: SimpleGuild[]) => {
			if (guilds.length > 0) {
				const defaultGuildId = guilds[0].id;
				dispatch(selectGuild(defaultGuildId));
			}
			resolve(guilds);
		});

		socket.on("guildsFetchedError", (error: string) => {
			reject(error);
		});
	});
});

const guildsSlice = createSlice({
	name: "guilds",
	initialState,
	reducers: {
		selectGuild(state, action: PayloadAction<string>) {
			if (state.selectedGuild !== action.payload) {
				state.selectedGuild = action.payload;
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchGuilds.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchGuilds.fulfilled, (state, action: PayloadAction<SimpleGuild[]>) => {
				state.status = "succeeded";
				state.guilds = action.payload;
			})
			.addCase(fetchGuilds.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message || "Failed to fetch guilds";
			});
	},
});

export const { selectGuild } = guildsSlice.actions;

export const selectAllGuilds = (state: RootState) => state.guilds.guilds;
export const selectCurrentGuildId = (state: RootState) => state.guilds.selectedGuild;

export default guildsSlice.reducer;
