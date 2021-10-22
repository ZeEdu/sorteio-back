import express from "express";
import SorteioController from "../controllers/Sorteio.controller";
import UserController from "../controllers/Users.controller";

const router = express.Router();

router.route("/").post(SorteioController.criarSorteio);
router.route("/podeSortear").get(SorteioController.podeSortear);

export default router;
