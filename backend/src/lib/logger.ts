import winston from "winston";
import path from "path";

const isDevelopment = process.env.NODE_ENV === "development";
const logsDir = path.join(process.cwd(), "logs");

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    ({ timestamp, level, message, stack }) =>
      `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? "\n" + stack : ""}`
  )
);

const consoleFormat = isDevelopment
  ? winston.format.combine(winston.format.colorize({ all: true }), format)
  : format;

const transports = [
  // Console transport - always enabled
  new winston.transports.Console({
    format: consoleFormat,
  }),

  // Error log file
  new winston.transports.File({
    filename: path.join(logsDir, "error.log"),
    level: "error",
    format,
    maxsize: 10485760, // 10MB
    maxFiles: 5,
  }),

  // Combined log file (all levels)
  new winston.transports.File({
    filename: path.join(logsDir, "combined.log"),
    format,
    maxsize: 10485760, // 10MB
    maxFiles: 5,
  }),
];

export const logger = winston.createLogger({
  level: isDevelopment ? "debug" : "warn",
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
      format,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
      format,
    }),
  ],
});

export default logger;
