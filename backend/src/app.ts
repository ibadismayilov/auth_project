import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/error.middleware";
import authRoute from "./routes/auth.routes";
import adminSecurityRoute from "./routes/admin.secury.routes";
import { corsOptions } from "./config/cors.config";
import { commonLimiter } from "./config/limiter.config";

const app = express();

app.set("trust proxy", 1);

app.use(commonLimiter);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/api/auth", authRoute);
app.use("/api/admin/security", adminSecurityRoute);

app.use(globalErrorHandler);

export default app;
