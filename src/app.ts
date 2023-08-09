import express, { Request, Response } from "express";
import cors from "cors";
import ussd from "./ussd.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.post("/api/ussd", ussd);
app.get("/api", (req: Request, res: Response) => {
  return res.status(200).json({ message: "🚀🍧✅" });
});
