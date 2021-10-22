import express from "express";
import SorteioController from "../controllers/Sorting.controller";
import UserController from "../controllers/Users.controller";

const router = express.Router();

router.route("/").get(SorteioController.criarSorteio);

export default router;
