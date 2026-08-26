const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: "Validation error",
            errors: Object.values(err.errors).map(
                (error) => error.message
            )
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            message: "A record with this information already exists"
        });
    }

    res.status(500).json({
        message: "Internal server error"
    });
};

module.exports = errorHandler;