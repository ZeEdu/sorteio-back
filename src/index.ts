import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app: Express = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const newUser = new CreateUser("3123131", "eduardo");

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Hello World</h1>");
});

app.listen(PORT, () => console.log(`Running on ${PORT}`));
