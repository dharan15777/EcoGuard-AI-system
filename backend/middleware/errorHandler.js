// Global Error Handler Middleware

const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler] Unhandled Exception:`, err.stack || err.message || err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal System Error',
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
