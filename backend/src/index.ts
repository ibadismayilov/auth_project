import "dotenv/config";
import app from "./app";
import { connectRedis } from "./lib/redis";

const PORT = process.env.PORT || 5001;

const start = async () => {
  await connectRedis();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down...");
    server.close(() => console.log("Process terminated"));
  });
};

start();
