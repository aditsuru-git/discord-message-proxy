import React from "react";
import ChannelList from "../components/ChannelList";
import GuildPicker from "../components/GuildPicker";

interface LayoutProps {
	children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
	<div className="flex h-screen bg-slate-900 text-white">
		{/* Guild Picker Sidebar */}
		<div className="w-16 bg-slate-950 flex flex-col items-center py-3 space-y-2">
			<GuildPicker />
		</div>

		{/* Channel List Sidebar */}
		<div className="w-60 bg-slate-800 flex flex-col">
			<ChannelList />
		</div>

		{/* Main Content Area */}
		<div className="flex-1 flex flex-col bg-slate-700">{children}</div>
	</div>
);

export default Layout;
