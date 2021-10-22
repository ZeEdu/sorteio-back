import express from "express";
import UserController from "../controllers/Users.controller";

const router = express.Router();

router.route("/:id").get(UserController.getUser);
router.route("/").get(UserController.getAllUsers);
router.route("/create").post(UserController.create);
router.route("/update").put(UserController.update);
router.route("/delete/:id").delete(UserController.delete);

export default router;
