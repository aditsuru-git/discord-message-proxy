import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

interface Config {
  port: number;
  nodeEnv: string;
  clientDist: string;
  frontendUrl: string;
  discordBotToken: string | null;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientDist: process.env.CLIENT_DIST || "public",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  discordBotToken: process.env.DISCORD_BOT_TOKEN || null,
};

console.log(config.clientDist);

export default config;
