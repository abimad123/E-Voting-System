// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const createLimiter = (opts = {}) =>
  rateLimit({
    windowMs: opts.windowMs || 15 * 60 * 1000, // 15 minutes
    max: opts.max || 10, // default max requests
    standardHeaders: true,
    legacyHeaders: false,
  });

module.exports = createLimiter;
