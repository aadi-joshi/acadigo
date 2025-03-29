// Get user role from request
exports.getRole = (req) => {
  if (!req.user) return 'anonymous';
  return req.user.role || 'student';
};
