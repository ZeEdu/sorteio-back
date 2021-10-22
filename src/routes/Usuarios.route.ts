import express from "express";
import UserController from "../controllers/Users.controller";

const router = express.Router();

router.route("/").get(UserController.pegarTodosUsuarios);
router.route("/criar").post(UserController.criar);
router.route("/atualizar").put(UserController.atualizar);
router.route("/deletar/:id").delete(UserController.deletar);

export default router;
