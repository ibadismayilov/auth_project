import { Request } from "express";

export const getSafeIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];

  let rawIp =
    typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : req.ip || req.socket.remoteAddress || "unknown";

  if (rawIp === "::1") return "127.0.0.1";

  if (rawIp.includes("::ffff:")) rawIp = rawIp.replace("::ffff:", "");

  return rawIp;
};
