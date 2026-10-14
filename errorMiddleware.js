function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
}

function errorHandler(error, _req, res, _next) {
  let statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  let message = error.message || "Something went wrong";

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors).map((item) => item.message).join(", ");
  } else if (error.code === 11000) {
    statusCode = 409;
    message = "A product with this SKU already exists";
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid product ID";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
  });
}

module.exports = { notFound, errorHandler };
