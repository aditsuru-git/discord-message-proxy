import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchChannels, selectAllChannels } from "../store/features/channelsSlice";
import { selectCurrentGuildId } from "../store/features/guildsSlice";

function ChannelList() {
	const navigate = useNavigate();
	const { channelId } = useParams<{ channelId: string }>();
	const dispatch: AppDispatch = useDispatch();

	const channels = useSelector(selectAllChannels);
	const selectedGuildId = useSelector(selectCurrentGuildId);
	const guild = useSelector((state: RootState) => state.guilds.guilds.find((g) => g.id === selectedGuildId));
	const channelsStatus = useSelector((state: RootState) => state.channels.status);

	useEffect(() => {
		if (selectedGuildId) {
			dispatch(fetchChannels(selectedGuildId));
		}
	}, [selectedGuildId, dispatch]);

	useEffect(() => {
		if (channelsStatus === "succeeded" && channels.length > 0 && !channelId) {
			navigate(`/channel/${channels[0].id}`);
		}
	}, [channels, channelsStatus, channelId, navigate]);

	const selectChannel = (id: string) => {
		navigate(`/channel/${id}`);
	};

	return (
		<div className="flex flex-col h-full">
			<div className="h-12 px-4 flex items-center justify-between border-b border-slate-700 shadow-sm">
				<h2 className="font-semibold text-white truncate">{guild?.name || "Server"}</h2>
			</div>

			<div className="flex-1 overflow-y-auto py-2">
				<div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Text Channels</div>
				<div className="space-y-0.5 mt-1">
					{channelsStatus === "loading" && <div className="px-2 text-slate-300">Loading...</div>}
					{channels.map((channel) => (
						<div
							key={channel.id}
							onClick={() => selectChannel(channel.id)}
							className={`mx-2 px-2 py-1 rounded flex items-center justify-between cursor-pointer group transition-colors duration-200
                                ${
																	channelId === channel.id
																		? "bg-slate-600 text-white"
																		: "text-slate-300 hover:bg-slate-700 hover:text-slate-100"
																}`}
						>
							<div className="flex items-center min-w-0 flex-1">
								<svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path d="M2 5a1 1 0 011-1h14a1 1 0 010 2H3a1 1 0 01-1-1zm0 6a1 1 0 011-1h14a1 1 0 010 2H3a1 1 0 01-1-1z" />
								</svg>
								<span className="truncate text-sm">{channel.name}</span>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="h-14 bg-slate-900 px-2 flex items-center justify-between border-t border-slate-700">
				{/* User Info Section... */}
			</div>
		</div>
	);
}

export default ChannelList;
