import express, { Express, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import dotenv from "dotenv";

import cors from "cors";

import usuarios from "./routes/Usuarios.route";
import sorteio from "./routes/Sorteio.route";

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/api/usuarios", usuarios);
app.use("/api/sorteio", sorteio);

app.use("/", (req: Request, res: Response) => {
  res.send("<h1>Hello World</h1>");
});
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
