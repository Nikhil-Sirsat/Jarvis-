
export default function errorHandler(err, req, res, next) {

    if (res.headersSent) {
        return next(err); // don't attempt to respond again
    }

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    if (err.code === 11000) {
        statusCode = 409;
        message = `Duplicate field value entered: ${JSON.stringify(err.keyValue)}`;
    }

    res.status(statusCode).json({
        status: "error",
        statusCode,
        message,
        errorCode: err.errorCode || "INTERNAL_ERROR",
    });
};
