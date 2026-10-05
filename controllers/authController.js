import prisma from "../db.js";
import bcrypt, { genSalt } from "bcrypt";
import jwt from "jsonwebtoken";

const loginUser = async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        const error = new Error("Some or all required information is missing.");
        error.status = 400;

        throw error;
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        const error = new Error("User not found.");
        error.status = 404;

        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        const error = new Error("Invalid credentials.");
        error.status = 401;

        throw error;
    }

    const refreshToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: process.env.JWT_REFRESH_EXPIRES_IN === "30d" ? 30 * 24 * 60 * 1000 : null // 30 days
    });

    res.status(200).json({
        user: { id: user.id, email: user.email },
        message: "Login successful."
    });
};

const issueAccessToken = (req, res) => {
    const { refreshToken } = req.cookies || {};

    if (!refreshToken) {
        const error = new Error("Refresh token not found.");
        error.status = 401;

        throw error;
    }

    let accessToken;

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        accessToken = jwt.sign({ id: decoded.id, email: decoded.email, role: decoded.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN });
    } catch (error) {
        const err = new Error("Invalid refresh token.");
        err.status = 401;

        throw err;
    }

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: process.env.JWT_ACCESS_EXPIRES_IN === "5m" ? 5 * 60 * 1000 : null, // 5 minutes
    });

    res.status(200).json({
        message: "Access token issued successfully."
    });
};

export { loginUser, issueAccessToken };