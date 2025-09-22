import cors from "cors";
import express, { Request, Response } from "express";
import { routes } from "./app/routes/routes";

export const app = express();

app.use(express.json());
app.use(cors({
  origin: "*"
})
);

app.use("/api/v1", routes);

app.get("/", (req: Request, res: Response) => {
  res.send("welcome to career copilot backend");
});
