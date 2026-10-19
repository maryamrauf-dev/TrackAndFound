// Lets async route handlers pass errors to Express without try/catch noise.
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
