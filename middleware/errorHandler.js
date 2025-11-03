

export default function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);

  const error = {
    message: err.message || "Internal Server Error",
  };

  if (process.env.NODE_ENV === "development") {
    error.stack = err.stack || "";
  }

  res.json({error});
}