import { Collection, Filter, MongoClient, ObjectId } from "mongodb";
import Usuario from "../models/Usuario";

let usuariosCollection: Collection<Usuario>;

class UsuariosDAO {
  static async injectDB(conn: MongoClient) {
    if (usuariosCollection) {
      return;
    }
    try {
      usuariosCollection = await conn
        .db(process.env.SUMMONERS_NS)
        .collection("users");
    } catch (e) {
      console.error(`Unable to establish collection handles in build: ${e}`);
    }
  }

  static async limparUsuarios() {
    try {
      await usuariosCollection.updateMany(
        {},
        {
          $set: {
            foiSelecionado: false,
            temAmigoSecreto: false,
          },
        }
      );
      return { sucesso: true };
    } catch (error) {
      console.error(error);
      return { error };
    }
  }
  static async encontrarUsuarios(pagina: number = 0, limite: number = 10) {
    try {
      const listaUsuarios = await usuariosCollection
        .find()
        .limit(limite)
        .skip(pagina * 10)
        .toArray();

      const totalUsuarios = await usuariosCollection.countDocuments();
      return {
        listaUsuarios,
        totalUsuarios,
      };
    } catch (error) {
      console.error(error);
      return { listaUsuarios: [], totalUsuarios: 0 };
    }
  }

  static async encontrarUsuarioPorId(id: string) {
    return usuariosCollection.findOne({ _id: new ObjectId(id) });
  }

  static async encontrarPorNome(username: string) {
    return usuariosCollection.findOne({ username });
  }
  static async encontrarPorEmail(email: string) {
    return usuariosCollection.findOne({ email });
  }

  static async inserirUsuario(user: Usuario) {
    try {
      await usuariosCollection.insertOne({
        nome: user.nome,
        email: user.email,
        temAmigoSecreto: user.temAmigoSecreto,
        foiSelecionado: user.foiSelecionado,
      });
      return { sucesso: true };
    } catch (e) {
      return { error: e };
    }
  }

  static async atualizarUsuario(user: Usuario) {
    try {
      await usuariosCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            nome: user.nome,
            email: user.email,
            temAmigoSecreto: user.temAmigoSecreto,
            foiSelecionado: user.foiSelecionado,
          },
        }
      );
      return { sucesso: true };
    } catch (e) {
      return { error: e };
    }
  }

  static async deleteUser(id: string) {
    try {
      await usuariosCollection.deleteOne({ _id: new ObjectId(id) });
      return { success: true };
    } catch (e) {
      console.error(e);
      return { error: e };
    }
  }
  static async contarDocumentos() {
    return usuariosCollection.countDocuments();
  }

  static async encontrarUsuarioDisponivel() {
    return usuariosCollection.findOne({ temAmigoSecreto: false });
  }

  static async contarUsuariosSemAmigoSecreto() {
    return usuariosCollection.countDocuments({ temAmigoSecreto: false });
  }
  static async encontrarUsuarioAleatorio(id: ObjectId) {
    const filter: Filter<Usuario> = { _id: { $ne: id }, foiSelecionado: false };
    return usuariosCollection
      .aggregate([{ $match: filter }, { $sample: { size: 1 } }])
      .toArray();
  }
}

export default UsuariosDAO;
