import prisma from "../db.js";

const control = async (req, res, next) => {
    const user = req.user;

    const userRole = await prisma.user.findUnique({
        where: {
            id: user.id
        },
        select: {
            role: true
        }
    });

    if (!userRole) {
        const error = new Error("User role not found.");
        error.status = 404;

        throw error;
    }

    if (userRole.role !== "ADMIN") {
        const error = new Error("Access denied. Admins only.");
        error.status = 403;

        throw error;
    }

    next();
}

export default control;