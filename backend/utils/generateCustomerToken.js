const jwt = require("jsonwebtoken");

const generateCustomerToken = (customerId) => {
  return jwt.sign(
    {
      id: customerId,
      type: "customer",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateCustomerToken;