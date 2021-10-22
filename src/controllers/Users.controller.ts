import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import UsuariosDAO from "../dao/UserDAO";
import Usuario from "../models/User";

class UserController {
  static async pegarTodosUsuarios(req: Request, res: Response) {
    const pagina = req.query["pagina"];
    let numeroPagina = 0;
    if (pagina && Number(pagina) > 0) {
      numeroPagina = Number(pagina);
    }
    const usuariosPorPagina = 10;
    const { listaUsuarios, totalUsuarios } =
      await UsuariosDAO.encontrarUsuarios(numeroPagina, usuariosPorPagina);

    const response = {
      users: listaUsuarios.map((user) => ({
        id: user._id?.toString(),
        nome: user.nome,
        email: user.email,
        temAmigoSecreto: user.temAmigoSecreto,
        foiSelecionado: user.foiSelecionado,
      })),
      qntUsuarios: totalUsuarios,
      usuariosPorPagina: usuariosPorPagina,
      pagina: numeroPagina,
    };
    return res.status(200).json(response);
  }

  static async criar(req: Request, res: Response) {
    try {
      const nome: string = req.body["nome"];
      const email: string = req.body["email"];
      const errors = [];

      if (!nome) {
        errors.push("Nome de usuário não informado");
      }

      if (nome && nome.length > 240) {
        errors.push("Nome de usuário maior que 240 caracteres");
      }

      if (nome && nome.length < 5) {
        errors.push("Nome de usuário menor que 5 caracteres");
      }

      if (!email) {
        errors.push("Email não informado");
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
      }
      const emailRegex = new RegExp(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      if (!emailRegex.test(email)) {
        errors.push("Formato de email inválido");
      }

      const encontrarPorEmail = await UsuariosDAO.encontrarPorEmail(email);

      if (encontrarPorEmail) {
        errors.push("Este email já esta sendo utilizado");
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
      }

      const criarUsuario = new Usuario(nome, email, false, false);
      const inserirUsuarioResultado = await UsuariosDAO.inserirUsuario(
        criarUsuario
      );
      if (!inserirUsuarioResultado.sucesso) {
        errors.push(inserirUsuarioResultado.error);
      }

      const retornaUsuarioDoBanco = await UsuariosDAO.encontrarPorEmail(email);
      if (!retornaUsuarioDoBanco) {
        errors.push("Error Interno, Tente novamente mais tarde");
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
      }

      return res.status(201).json({
        data: retornaUsuarioDoBanco,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(400)
        .json({ errors: ["Erro Interno. Tente novamente mais tarde. "] });
    }
  }

  static async atualizar(req: Request, res: Response) {
    try {
      const id = req.body["id"];
      const nome = req.body["nome"];
      const email = req.body["email"];
      const errors = [];

      if (!nome) {
        errors.push("Nome de usuário não informado");
      }

      if (nome && nome.length > 240) {
        errors.push("Nome de usuário maior que 240 caracteres");
      }

      if (nome && nome.length < 5) {
        errors.push("Nome de usuário menor que 5 caracteres");
      }

      if (!email) {
        errors.push("Email não informado");
      }

      const usuarioPorId = await UsuariosDAO.encontrarUsuarioPorId(id);

      if (!usuarioPorId) {
        return res
          .status(400)
          .json("Usuário referente a id informada não foi encontrado");
      }
      if (usuarioPorId._id?.toString() !== id) {
        errors.push("Dados informados não são referentes ao mesmo usuário");
      }

      if (errors.length > 0) {
        return res.status(400).json({ erros: errors });
      }

      const updatedUser = new Usuario(
        nome,
        email,
        usuarioPorId.temAmigoSecreto,
        usuarioPorId.foiSelecionado,
        new ObjectId(id)
      );

      const atualizarResultado = await UsuariosDAO.atualizarUsuario(
        updatedUser
      );
      if (!atualizarResultado.sucesso) {
        errors.push(atualizarResultado.error);
      }

      const encontrarUsuarioNoBanco = await UsuariosDAO.encontrarPorEmail(
        updatedUser.email
      );
      if (!encontrarUsuarioNoBanco) {
        errors.push(
          "Um erro interno aconteceu ao atualizar o usuário. Por favor, tente novamente mais tarde"
        );
      }

      if (errors.length > 0) {
        return res.status(400).json({ erros: errors });
      }

      return res.status(202).json({ user: updatedUser });
    } catch (error) {
      return res
        .status(400)
        .json({ errors: ["Erro Interno. Tente novamente mais tarde."] });
    }
  }
  static async deletar(req: Request, res: Response) {
    try {
      const id = req.params["id"];
      const errors = [];

      if (!id) {
        errors.push("Nenhuma id foi informada.");
      }
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      const queryByIdResult = await UsuariosDAO.encontrarUsuarioPorId(id);
      if (!queryByIdResult) {
        errors.push("Usuário não encontrado.");
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const deleteResult = await UsuariosDAO.deleteUser(id);
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
