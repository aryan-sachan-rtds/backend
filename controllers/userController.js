import prisma from "../db.js";
import bcrypt, { genSalt } from "bcrypt";

const fetchUser = async (req, res) => {
    let { id, email } = req.query || {};
    id = parseInt(id);

    if (!id && !email) {
        const error = new Error("Id or email is missing.");
        error.status = 400;

        throw error;
    }

    let user;

    if (id) {
        user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true
            }
        });
    } else {
        user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true
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

export { fetchUser, createUser };