import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { prisma_primary, prisma_replica } from "./db.js";

import { router as userRouter } from "./routes/userRoutes.js";
import { router as authRouter } from "./routes/authRoutes.js";

import errorMiddleware from "./middlewares/errorMiddleware.js";

import pinoHttp from "pino-http";
import logger from "./logger.js";

import client from "prom-client";

client.collectDefaultMetrics();

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({
    logger,
    autoLogging: {
        ignore: (req) => {
            const path = req.url?.split("?")[0];

            return ["/health", "/ready", "/live", "/metrics"].includes(path);
        }
    }
}));

app.use("/users", userRouter);
app.use("/auth", authRouter);

app.get("/health", (req, res) => {
    return res.status(200).json({ "status": "healthy" });
});

app.get("/live", (req, res) => {
    return res.status(200).json({
        status: "alive",
    });
});

app.get("/ready", async (req, res) => {
    const checks = await Promise.allSettled([
        prisma_primary.$queryRaw`SELECT 1`,
        prisma_replica.$queryRaw`SELECT 1`,
    ]);

    const [primary, replica] = checks.map(
        (result) => result.status === "fulfilled"
    );

    if (!primary) {
        logger.error(
            { err: checks[0].reason },
            "Primary database is unavailable"
        );
    }

    if (!replica) {
        logger.error(
            { err: checks[1].reason },
            "Replica(s) are unavailable"
        );
    }

    const ready = primary && replica;

    return res.status(ready ? 200 : 503).json({
        status: ready ? "ready" : "not ready",
        primary: primary ? "available" : "unavailable",
        replicas: replica ? "available" : "unavailable",
    });
});

app.get("/metrics", async (req, res) => {
    try {
        res.set("Content-Type", client.register.contentType);
        res.end(await client.register.metrics());
    } catch (error) {
        const Error = new Error("Failed to collect metrics");
        error.status = 500;

        throw Error;
    }
})

app.use(errorMiddleware);

app.listen(process.env.NODE_PORT, () => {
    logger.info(`Server is running on port ${process.env.NODE_PORT}`);
});