import { CorsOptions } from "cors";

const allowed_origins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowed_origins.includes(origin)) callback(null, true);
    else callback(new Error("Blocked by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};