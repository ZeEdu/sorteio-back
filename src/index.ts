import { MongoClient } from "mongodb";
import app from "./app";
import UsuariosDAO from "./dao/UsuariosDAO";

const PORT = process.env.PORT || 80;
const uri =
  "mongodb+srv://eduardo:eduardo@cluster0.m0kue.mongodb.net/sorteio?retryWrites=true&w=majority";

const client = new MongoClient(uri ? uri : "");
const run = async () => {
  client
    .connect()
    .then(async (result) => {
      await UsuariosDAO.injectDB(result);
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
