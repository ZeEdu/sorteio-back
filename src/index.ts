import { MongoClient } from "mongodb";
import app from "./app";
import UserDAO from "./dao/UserDAO";

const PORT = process.env.PORT || 3000;
const uri =
  "mongodb+srv://eduardo:eduardo@cluster0.m0kue.mongodb.net/sorteio?retryWrites=true&w=majority";

const client = new MongoClient(uri);
const run = async () => {
  client
    .connect()
    .then(async (result) => {
      await UserDAO.injectDB(result);
      app.listen(PORT, () => {
        console.log(`Application Running at port ${PORT}`);
      });
    })
    .catch((err: any) => {
      console.error(err.stack);
      process.exit(1);
    });
};

run();
