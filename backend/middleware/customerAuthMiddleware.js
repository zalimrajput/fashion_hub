const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const customerAuthMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Verify Token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // Check token belongs to customer
      if (decoded.type !== "customer") {
        return res.status(401).json({
          success: false,
          message: "Invalid customer token",
        });
      }

      // Get Customer
      req.customer = await Customer.findById(
        decoded.id
      ).select("-password");

      if (!req.customer) {
        return res.status(401).json({
          success: false,
          message: "Customer not found",
        });
      }

      next();

    } else {

      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });

    }

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });

  }
};

module.exports = customerAuthMiddleware;