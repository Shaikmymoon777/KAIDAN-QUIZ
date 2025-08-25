class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Maintains proper stack trace for where our error was thrown (only available in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorResponse);
    }

    this.name = this.constructor.name;
  }

  // Static method to create a new error response
  static create(message, statusCode) {
    return new ErrorResponse(message, statusCode);
  }

  // Convert error to JSON format
  toJSON() {
    return {
      success: false,
      error: this.message,
      statusCode: this.statusCode,
      // Don't include stack trace in production
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }

  // Handle errors in Express route handlers
  static handle(res, error) {
    console.error(error);

    // Default to 500 if status code is not set
    const statusCode = error.statusCode || 500;
    const response = {
      success: false,
      error: error.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };

    // Handle JWT specific errors
    if (error.name === 'JsonWebTokenError') {
      response.error = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
      response.error = 'Token expired';
      response.expiredAt = error.expiredAt;
    }

    return res.status(statusCode).json(response);
  }
}

module.exports = ErrorResponse;
