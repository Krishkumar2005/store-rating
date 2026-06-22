const { verifyToken } = require("../utils/jwt");
const { sendError } = require("../utils/response");
const { prisma } = require("../config/prisma.js");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("middleware header ", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("middleware header inside ", authHeader);
      return sendError(res, "Access denied. No token provided.", 401);
    }

    const token = authHeader.split(" ")[1];
    console.log("middleware token ", token);
    const decoded = verifyToken(token);
    console.log("decoded user next", decoded)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, address: true },
    });
    console.log("decoded user res ", user)
    if (!user) {
      return sendError(res, "User not found. Token may be invalid.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("AUTH MIDDLEWARE ERROR:", error.message, error.code);
    return sendError(res, "Invalid or expired token.", 401);
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, "Access denied. Insufficient permissions.", 403);
    }
    next();
  };
};

module.exports = { authenticate, authorizeRoles };
