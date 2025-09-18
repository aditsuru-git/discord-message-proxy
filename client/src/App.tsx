import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initSocket, socket } from "./api/socket";
import ChannelMessages from "./components/ChannelMessages";
import Layout from "./layout/Layout";
import { useDispatch } from "react-redux";
import { type AppDispatch } from "./store";
import { fetchGuilds } from "./store/features/guildsSlice";
import { setBotUserId } from "./store/features/messagesSlice";

function App() {
	const dispatch: AppDispatch = useDispatch();

	useEffect(() => {
		initSocket();
		dispatch(fetchGuilds());

		socket.on("botReady", (payload) => {
			dispatch(setBotUserId(payload.botId));
		});
	}, [dispatch]);

	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={
						<Layout>
							<div className="flex items-center justify-center h-full text-slate-400">
								Select a channel to start chatting
							</div>
						</Layout>
					}
				/>
				<Route
					path="/channel/:channelId"
					element={
						<Layout>
							<ChannelMessages />
						</Layout>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}
export default App;
