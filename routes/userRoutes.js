import express from "express";
import { createUser, fetchUser } from "../controllers/userController.js";

import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/user").get(protect, fetchUser);
router.route("/create-user").post(protect, createUser);

export { router };