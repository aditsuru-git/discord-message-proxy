import express from "express";
import cors from "cors";
import helmet from "helmet";
import config from "@/config";
import errorHandler from "@/middlewares/errorHandler";
import path from "path";

const app = express();

if (config.nodeEnv === "development") {
  // Only enable CORS in dev; in prod frontend is same origin
  app.use(cors({ origin: config.frontendUrl }));
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // Allow images from self, Discord's CDN, and the emoji CDN
        "img-src": ["'self'", "cdn.discordapp.com", "cdn.jsdelivr.net"],
        // The emoji picker may also lazy-load scripts (workers) from its CDN
        "script-src": ["'self'", "cdn.jsdelivr.net"],
      },
    },
  }),
);

app.use(express.json());
app.use(express.static(config.clientDist));

app.get(/^(?!\/api).*(?<!\.\w{2,5})$/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// Global error handler
app.use(errorHandler);

export default app;
