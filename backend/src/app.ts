import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/error.middleware";
import { httpLogger } from "./middlewares/http-logger.middleware";
import authRoute from "./routes/auth.routes";
import adminSecurityRoute from "./routes/admin.secury.routes";
import { corsOptions } from "./config/cors.config";
import { adminLimiter } from "./config/limiter.config";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(httpLogger);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/api/auth", authRoute);
app.use("/api/admin/security", adminLimiter, adminSecurityRoute);

app.use(globalErrorHandler);

export default app;
