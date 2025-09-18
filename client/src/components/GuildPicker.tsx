import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchGuilds, selectGuild, selectAllGuilds, selectCurrentGuildId } from "../store/features/guildsSlice";

function GuildPicker() {
	const dispatch: AppDispatch = useDispatch();
	const guilds = useSelector(selectAllGuilds);
	const selectedGuildId = useSelector(selectCurrentGuildId);
	const guildsStatus = useSelector((state: RootState) => state.guilds.status);

	useEffect(() => {
		if (guildsStatus === "idle") {
			dispatch(fetchGuilds());
		}
	}, [guildsStatus, dispatch]);

	const handleGuildSelect = (guildId: string) => {
		dispatch(selectGuild(guildId));
	};

	return (
		<div className="w-full flex flex-col items-center space-y-2">
			<div className="w-12 h-12 bg-blue-600 rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer group hover:bg-blue-500">
				<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
					<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
				</svg>
			</div>

			<div className="w-8 h-0.5 bg-slate-600 rounded-full"></div>

			{guilds.map((guild) => (
				<div
					key={guild.id}
					onClick={() => handleGuildSelect(guild.id)}
					className={`relative w-12 h-12 rounded-2xl hover:rounded-xl transition-all duration-200 cursor-pointer group flex items-center justify-center text-white font-semibold text-sm overflow-hidden
                        ${selectedGuildId === guild.id ? "rounded-xl bg-blue-500" : "bg-slate-700"}
                        hover:shadow-lg hover:bg-blue-500
                    `}
				>
					{guild.iconURL ? (
						<img src={guild.iconURL} alt={guild.name} className="w-full h-full" />
					) : (
						<span>{guild.name.charAt(0).toUpperCase()}</span>
					)}

					{selectedGuildId === guild.id && (
						<div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
					)}

					<div className="absolute left-16 bg-slate-900 text-white px-2 py-1 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
						{guild.name}
					</div>
				</div>
			))}
		</div>
	);
}

export default GuildPicker;
