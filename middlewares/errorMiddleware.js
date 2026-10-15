const errorMiddleware = (err, req, res, next) => {
    const status = err.status || 500;

    req.log.error(
        {
            err,
            status,
            method: req.method,
            url: req.originalUrl,
        },
        "Request failed"
    );

    res.status(status).json({
        error: err.message
    });
};

export default errorMiddleware;