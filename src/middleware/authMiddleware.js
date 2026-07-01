const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendResponse } = require("../utils/response");

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendResponse(res, {
        statusCode: 401,
        status: "error",
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendResponse(res, {
        statusCode: 401,
        status: "error",
        message: "User not found",
      });
    }

    delete user.password;
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    sendResponse(res, {
      statusCode: 401,
      status: "error",
      message: "Invalid or expired token",
    });
  }
};
