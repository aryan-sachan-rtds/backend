import prisma from "../db.js";
import bcrypt, { genSalt } from "bcrypt";

const fetchUser = async (req, res) => {
    const usr = req.user || {};

    if (!usr) {
        const error = new Error("Login before accessing this resource.");
        error.status = 401;

        throw Error;
    }

    let user;
    const id = usr.id;

    if (id) {
        user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        });
    } else {
        user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        });
    }

    if (!user) {
        const error = new Error("User not found.");
        error.status = 404;

        throw error;
    }

    res.status(200).json({ user });
}

const fetchUsers = async (req, res) => {
    const { page, limit } = req.query || {};

    if (!page || !limit) {
        const error = new Error("Page and limit are required.");
        error.status = 400;

        throw error;
    }

    const users = await prisma.user.findMany({
        take: parseInt(limit),
        skip: ((parseInt(page) - 1) * parseInt(limit)),
        orderBy: {
            created_at: "desc",
        },
    });

    if (!users) {
        const error = new Error("Users not found.");
        error.status = 404;

        throw error;
    }

    res.status(200).json({ users });
};

const createUser = async (req, res) => {
    const { email, name, password } = req.body || {};

    if (!email || !name || !password) {
        const error = new Error("Some or all required information is missing.");
        error.status = 400;

        throw error;
    }

    const salt = await genSalt(10);
    const hashed_password = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: hashed_password
        },
        select: {
            id: true,
            email: true,
            name: true
        }
    });

    if (!user) {
        console.log(user);

        const error = new Error("User not created.");
        error.status = 500;

        throw error;
    }

    res.status(201).json({ user });
}

export { fetchUser, fetchUsers, createUser };