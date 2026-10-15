import pino from "pino";

const logger = pino({
    level: process.env.LOG_LEVEL || "info",

    base: {
        service: process.env.SERVICE_NAME || "backend",
        environment: process.env.NODE_ENV || "development",
    },

    redact: {
        paths: [
            "req.headers.cookie",
            "res.headers.set-cookie",
            "req.headers.authorization",
        ],
        censor: "[REDACTED]",
    },  

    timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;