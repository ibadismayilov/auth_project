import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/error.middleware";

import authRoute from "./routes/auth.routes";

const PORT = process.env.PORT || 5001;
const allowed_origins = process.env.ALLOWED_ORIGINS || [
  "http://localhost:3000",
];

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowed_origins.includes(origin)) callback(null, true);
      else callback(new Error("Blocked by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.get("/ping", (req: express.Request, res: express.Response) => {
  res.status(200).send("Success");
});

app.use("/api/auth", authRoute);

app.use(globalErrorHandler);

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Server shutting down...");

  server.close(() => {
    console.log("Process terminated");
  });
});
