// Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.

const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : header;

  if (!token) {
    return res.status(401).json({ error: "No token ❌" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token ❌" });
  }
};

module.exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied ❌" });
    }
    next();
  };
};