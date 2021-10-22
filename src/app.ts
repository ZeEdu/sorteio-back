import express, { Express, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import dotenv from "dotenv";

import cors from "cors";

import usuarios from "./routes/Usuarios.route";
import sorteio from "./routes/Sorteio.route";

dotenv.config();

const app: Express = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(cors());

// app.options("*", cors())

app.use("/api/usuarios", cors(), usuarios);
app.use("/api/sorteio", cors(), sorteio);

app.use("/", (req: Request, res: Response) => {
  res.send("<h1>Hello World</h1>");
});
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
