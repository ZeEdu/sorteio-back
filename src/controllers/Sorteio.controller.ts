import { Request, Response } from "express";
import nodemailer from "nodemailer";

import UserDAO from "../dao/UserDAO";
import User from "../models/User";

class SorteioController {
  static async criarSorteio(req: Request, res: Response) {
    try {
      const getAvailableFriendCount =
        await UserDAO.findUsersWithoutSecretFriendCount();

      const emailList = [];

      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: "americo.howell67@ethereal.email",
          pass: "Q3YBRrY4Sb9DPeXqPz",
        },
      });

      for (let index = 0; index < getAvailableFriendCount; index++) {
        const sender = await UserDAO.findAvailableUser();

        if (!sender) return res.status(400).json({ error: "Error Interno" });
        if (sender._id === undefined)
          return res.status(400).json({ error: "Error Interno" });

        const receiver = (
          (await UserDAO.getRandomSelectableFriend(sender._id)) as User[]
        )[0];

        let info = await transporter.sendMail({
          from: "americo.howell67@ethereal.email",
          to: sender.email,
          subject: "Amigo Secreto",
          text: `Você tirou o (a) ${
            receiver.nome
          } no sorteio. E pra não ter erro o email é ${
            receiver.email
          } e o _id é ${receiver._id?.toString()}`,
        });

        const messageUrl = nodemailer.getTestMessageUrl(info);
        if (messageUrl) {
          emailList.push(messageUrl);
        }

        const updatedSender = new User(
          sender.nome,
          sender.email,
          true,
          sender.foiSelecionado,
          sender._id
        );

        const updateSenderResult = await UserDAO.updateUser(updatedSender);
        if (!updateSenderResult.success) {
          return res.status(500).json({ error: "Internal Error" });
        }

        const updatedReceiver = new User(
          receiver.nome,
          receiver.email,
          receiver.temAmigoSecreto,
          true,
          receiver._id
        );
        const updateReceiverResult = await UserDAO.updateUser(updatedReceiver);
        if (!updateReceiverResult.success) {
          return res.status(500).json({ error: "Internal Error" });
        }
      }
      res.status(200).json({ success: true, emailList });
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
  static async podeSortear(req: Request, res: Response) {
    try {
      const countResult = await UserDAO.getDocumentsCount();
      const isEven = countResult % 2 === 0;
      return res.status(200).json({ response: isEven });
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
}

export default SorteioController;
