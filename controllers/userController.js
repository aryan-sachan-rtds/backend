import { prisma_primary, prisma_replica } from "../db.js";
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
        user = await prisma_primary.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        });
    } else {
        user = await prisma_primary.user.findUnique({
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

    const users = await prisma_replica.user.findMany({
        take: parseInt(limit),
        skip: ((parseInt(page) - 1) * parseInt(limit)),
        orderBy: {
            created_at: "desc",
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        }
    });

    console.log("READ DATABASE HIT:", result);

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

    const user = await prisma_primary.user.create({
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

const createPost = async (req, res) => {
    const { title, content } = req.body || {};

    if (!title || !content) {
        const error = new Error("Some or all required information is missing.");
        error.status = 400;

        throw error;
    }

    const blog = await prisma_primary.post.create({
        data: {
            title,
            content,
            authorId: req.user.id
        },
        select: {
            id: true,
            title: true,
            published: true,
        }
    });

    if (!blog) {
        const error = new Error("Blog not created.");
        error.status = 500;

        throw error;
    }

    res.status(201).json({ blog });
}

export { fetchUser, fetchUsers, createUser, createPost };