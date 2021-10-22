import { Request, Response } from "express";
import nodemailer from "nodemailer";

import UsuariosDAO from "../dao/UsuariosDAO";
import Usuario from "../models/Usuario";

class SorteioController {
  static async criarSorteio(req: Request, res: Response) {
    try {
      const qntUsuarios = await UsuariosDAO.contarDocumentos();

      if (qntUsuarios % 2 !== 0) {
        return res.status(400).json({
          error: [
            "Não é possivel realizar o sorteio com um número impar de usuários",
          ],
        });
      }

      const limpezaResultado = await UsuariosDAO.limparUsuarios();

      if (!limpezaResultado.sucesso) {
        return res.status(400).json({
          error: ["Um erro ocorreu ao criar um novo sorteio"],
        });
      }

      const listaDeEmail = [];

      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: "americo.howell67@ethereal.email",
          pass: "Q3YBRrY4Sb9DPeXqPz",
        },
      });

      for (let index = 0; index < qntUsuarios; index++) {
        const remetente = await UsuariosDAO.encontrarUsuarioDisponivel();

        if (!remetente)
          return res
            .status(500)
            .json({ error: ["Error Interno. Usuário não foi encontrado."] });
        if (remetente._id === undefined)
          return res.status(400).json({
            error: ["Error Interno. Dados de usuário são incompletos"],
          });

        const receptor = (
          (await UsuariosDAO.encontrarUsuarioAleatorio(
            remetente._id
          )) as Usuario[]
        )[0];

        let info = await transporter.sendMail({
          from: "americo.howell67@ethereal.email",
          to: remetente.email,
          subject: "Amigo Secreto",
          text: `Você tirou o (a) ${
            receptor.nome
          } no sorteio. E pra não ter erro o email é ${
            receptor.email
          } e o _id é ${receptor._id?.toString()}`,
        });

        const emailUrl = nodemailer.getTestMessageUrl(info);

        if (emailUrl) {
          listaDeEmail.push(emailUrl);
        }

        const remetenteAtualizado = new Usuario(
          remetente.nome,
          remetente.email,
          true,
          remetente.foiSelecionado,
          remetente._id
        );

        const remetenteAtualizadoResultado = await UsuariosDAO.atualizarUsuario(
          remetenteAtualizado
        );
        if (!remetenteAtualizadoResultado.sucesso) {
          return res.status(500).json({ error: ["Internal Error"] });
        }

        const receptorAtualizado = new Usuario(
          receptor.nome,
          receptor.email,
          receptor.temAmigoSecreto,
          true,
          receptor._id
        );
        const receptorAtualizadoResultado = await UsuariosDAO.atualizarUsuario(
          receptorAtualizado
        );

        if (!receptorAtualizadoResultado.sucesso) {
          return res.status(500).json({ error: ["Internal Error"] });
        }
      }
      res.status(200).json({ sucesso: true, listaDeEmail });
    } catch (error) {
      return res.status(400).json({ error: [error] });
    }
  }
}

export default SorteioController;
