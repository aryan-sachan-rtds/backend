import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { router as userRouter } from "./routes/userRoutes.js";
import { router as authRouter } from "./routes/authRoutes.js";

import errorMiddleware from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/users", userRouter);
app.use("/auth", authRouter);

app.get("/health", (req, res) => {
    return res.status(200).json({ "message": "hello" });
});

app.use(errorMiddleware);

app.listen(3000, () => {
    console.log("Server is listening...");
});