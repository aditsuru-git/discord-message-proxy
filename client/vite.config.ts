import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [tailwindcss(), react()],
	define: {
		"process.env.VITE_BACKEND_URL": JSON.stringify(process.env.REACT_APP_BACKEND_URL),
	},
});
