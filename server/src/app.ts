import express from "express";
import cors from "cors";
import helmet from "helmet";
import config from "@/config";
import errorHandler from "@/middlewares/errorHandler";

const app = express();

if (config.nodeEnv === "development") {
  // Only enable CORS in dev; in prod frontend is same origin
  app.use(cors({ origin: config.frontendUrl }));
}
app.use(helmet());
app.use(express.json());
app.use(express.static(config.clientDist));

// Global error handler
app.use(errorHandler);

export default app;
