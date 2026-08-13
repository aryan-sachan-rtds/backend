import express from "express";
import { loginUser, issueAccessToken } from "../controllers/authController.js";

const router = express.Router();

router.route("/login").post(loginUser);
router.route("/token").get(issueAccessToken);

export { router };