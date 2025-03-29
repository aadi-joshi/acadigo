const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  // ...existing code...
};

exports.authorize = (...roles) => {
  // ...existing code...
};
