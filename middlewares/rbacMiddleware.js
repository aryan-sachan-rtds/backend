import prisma from "../db.js";

const control = (...allowedRoles) => {
    return async (req, res, next) => {
        const userRole = req.user.role;

        if (!userRole) {
            const error = new Error("User role not found.");
            error.status = 404;
            throw error;
        }

        if (!allowedRoles.includes(userRole)) {
            const error = new Error("Access denied.");
            error.status = 403;
            throw error;
        }

        next();
    };
};

export default control;