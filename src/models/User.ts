import { ObjectId } from "mongodb";
import AbstractUser from "./AbstractUser";

export default class User extends AbstractUser {
  constructor(
    nome: string,
    email: string,
    public temAmigoSecreto: boolean,
    public foiSelecionado: boolean,
    public _id?: ObjectId
  ) {
    super(nome, email);
  }
}
