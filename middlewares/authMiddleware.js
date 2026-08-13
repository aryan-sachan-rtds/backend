import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
    const token = req.cookies.accessToken || {};

    if (!token) {
        const error = new Error("Access token not found.");
        error.status = 401;

        throw error;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        const err = new Error("Invalid access token.");
        err.status = 401;

        throw err;
    }
};

export default protect;