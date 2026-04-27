import express from "express";
import cors from "cors";
import helmet from "helmet";
import { globalErrorHandler } from "./middlewares/error.middleware";

const PORT = process.env.PORT || 5001;

const app = express();

app.use(globalErrorHandler);

app.get("/ping", (req: express.Request, res: express.Response) => {
  res.status(201).send("Success");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
});
