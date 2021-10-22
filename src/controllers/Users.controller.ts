import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import UserDAO from "../dao/UserDAO";
import User from "../models/User";
import Utils from "../utils";

class UserController {
  static async getAllUsers(req: Request, res: Response) {
    console.log(req.params);
    const page = req.query["page"];
    let pageNumber = 0;
    if (page && Number(page) > 0) {
      pageNumber = Number(page);
    }

    const usersPerPage = 10;

    console.log("pageNumber", pageNumber);
    const { usersList, totalUsers } = await UserDAO.getUsers(
      pageNumber,
      usersPerPage
    );

    const response = {
      users: usersList.map((user) => ({
        id: user._id?.toString(),
        nome: user.nome,
        email: user.email,
        temAmigoSecreto: user.temAmigoSecreto,
        foiSelecionado: user.foiSelecionado,
      })),
      userCount: totalUsers,
      usersPerPage,
      page: pageNumber,
    };
    return res.status(200).json(response);
  }

  static async getUser(req: Request, res: Response) {
    const id = req.params["id"];
    if (!id) {
      return res.status(400).json({ error: "Id não informada" });
    }

    const findResult = await UserDAO.findUserById(id);

    if (!findResult) {
      return res.status(400).json({ resultado: "Usuário Não Encontrado" });
    }

    return res.status(200).json(findResult);
  }

  static async create(req: Request, res: Response) {
    try {
      const username: string = req.body["name"];
      const email: string = req.body["email"];
      const errors = [];

      if (!username) {
        errors.push("Nome de usuário não informado");
      }

      if (username && username.length > 240) {
        errors.push("Nome de usuário maior que 240 caracteres");
      }

      if (username && username.length < 5) {
        errors.push("Nome de usuário menor que 5 caracteres");
      }

      if (!email) {
        errors.push("Email não informado");
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // if (!Utils.emailRegex().test(email)) {
      //   errors.push({ emailFormat: "Formato de email inválido" });
      // }

      const searchByEmailResult = await UserDAO.findByEmail(email);

      if (searchByEmailResult) {
        errors.push("Este email já esta sendo utilizado");
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const createUser = new User(username, email, false, false);
      const insertUser = await UserDAO.insertUser(createUser);

      if (!insertUser.success) {
        errors.push(insertUser.error);
      }

      const getUserFromDB = await UserDAO.findByEmail(email);
      if (!getUserFromDB) {
        errors.push("Error Interno, Tente novamente mais tarde");
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      return res.status(201).json({
        data: getUserFromDB,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(400)
        .json({ errors: ["Erro Interno. Tente novamente mais tarde. "] });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = req.body["id"];
      const name = req.body["name"];
      const email = req.body["email"];
      const errors = [];

      if (!name) {
        errors.push("Nome de usuário não informado");
      }

      if (name && name.length > 240) {
        errors.push("Nome de usuário maior que 240 caracteres");
      }

      if (name && name.length < 5) {
        errors.push("Nome de usuário menor que 5 caracteres");
      }

      if (!email) {
        errors.push("Email não informado");
      }

      const getById = await UserDAO.findUserById(id);

      if (!getById) {
        return res
          .status(400)
          .json("Usuário referente a id informada não foi encontrado");
      }
      if (getById._id?.toString() !== id) {
        errors.push("Dados informados não são referentes ao mesmo usuário");
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const updatedUser = new User(
        name,
        email,
        getById.temAmigoSecreto,
        getById.foiSelecionado,
        new ObjectId(id)
      );

      const updateResult = await UserDAO.updateUser(updatedUser);
      if (!updateResult.success) {
        errors.push(updateResult.error);
      }

      const getUserFromDB = await UserDAO.findByEmail(updatedUser.email);
      if (!getUserFromDB) {
        errors.push(
          "Um erro interno aconteceu ao atualizar o usuário. Por favor, tente novamente mais tarde"
        );
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      return res.status(202).json({ user: updatedUser });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ errors: ["Erro Interno. Tente novamente mais tarde."] });
    }
  }
  static async delete(req: Request, res: Response) {
    try {
      const id = req.params["id"];
      const errors = [];

      if (!id) {
        errors.push("Nenhuma id foi informada.");
      }
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      const queryByIdResult = await UserDAO.findUserById(id);
      if (!queryByIdResult) {
        errors.push("Usuário não encontrado.");
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const deleteResult = await UserDAO.deleteUser(id);
      if (!deleteResult) {
        errors.push("Usuário não encontrado.");
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      return res.status(202).json({ success: true });
    } catch (error) {
      return res
        .status(400)
        .json({ errors: ["Erro Interno. Tente novamente mais tarde."] });
    }
  }
}

export default UserController;
