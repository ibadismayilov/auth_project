import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Server shutting down...");
  server.close(() => console.log("Process terminated"));
});