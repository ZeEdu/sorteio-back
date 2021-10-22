import {
  AggregateOptions,
  Collection,
  Filter,
  MongoClient,
  ObjectId,
} from "mongodb";
import User from "../models/User";

let users: Collection<User>;

class UserDAO {
  static async injectDB(conn: MongoClient) {
    if (users) {
      return;
    }
    try {
      users = await conn.db(process.env.SUMMONERS_NS).collection("users");
    } catch (e) {
      console.error(`Unable to establish collection handles in build: ${e}`);
    }
  }
  static async getUsers(page: number = 0, limit: number = 10) {
    try {
      const usersList = await users
        .find()
        .limit(limit)
        .skip(page * 10)
        .toArray();

      const totalUsers = await users.countDocuments();
      return {
        usersList,
        totalUsers,
      };
    } catch (error) {
      console.error(error);
      return { usersList: [], totalUsers: 0 };
    }
  }

  static async findUserById(id: string) {
    return users.findOne({ _id: new ObjectId(id) });
  }

  static async findByUsername(username: string) {
    return users.findOne({ username });
  }
  static async findByEmail(email: string) {
    return users.findOne({ email });
  }

  static async insertUser(user: User) {
    try {
      await users.insertOne({
        nome: user.nome,
        email: user.email,
        temAmigoSecreto: user.temAmigoSecreto,
        foiSelecionado: user.foiSelecionado,
      });
      return { success: true };
    } catch (e) {
      return { error: e };
    }
  }

  static async updateUser(user: User) {
    try {
      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            nome: user.nome,
            email: user.email,
            temAmigoSecreto: user.temAmigoSecreto,
          },
        }
      );
      return { success: true };
    } catch (e) {
      return { error: e };
    }
  }

  static async deleteUser(id: string) {
    try {
      await users.deleteOne({ _id: new ObjectId(id) });
      return { success: true };
    } catch (e) {
      console.error(e);
      return { error: e };
    }
  }
  static async getDocumentsCount() {
    return users.countDocuments();
  }

  static async findAvailableUser() {
    return users.findOne({ temAmigoSecreto: false });
  }

  static async findUsersWithoutSecretFriendCount() {
    return users.countDocuments({ temAmigoSecreto: false });
  }
  static async getRandomSelectableFriend(id: ObjectId) {
    const filter: Filter<User> = { _id: { $ne: id }, foiSelecionado: false };

    return users
      .aggregate([{ $match: filter }, { $sample: { size: 1 } }])
      .toArray();
  }
}

export default UserDAO;
