import express from "express";
import { createUser, fetchUser, fetchUsers, createPost } from "../controllers/userController.js";

import protect from "../middlewares/authMiddleware.js";
import control from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.route("/user").get(protect, fetchUser);
router.route("/create-user").post(createUser);
router.route("/fetch-users").get(protect, control("ADMIN"), fetchUsers);

router.route("/create-post").post(protect, control("USER"), createPost);

export { router };