import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

const secretKey = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  let authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  const token = authHeader.split(" ")[1]; 

  // console.log(token);
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token is not valid" });
    }
    // console.log(decoded);
    req.user = decoded; // Store the decoded payload in req.user
    next();
  });
};

const checkRole = (allowedRoles) => (req, res, next) => {
  // Ensure allowedRoles is always an array, even if a single role string is provided
  if (!Array.isArray(allowedRoles)) {
    allowedRoles = [allowedRoles];
  }

  verifyToken(req, res, () => {
    // Check if the user's role is included in the allowedRoles array
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    }
  });
};

const generateToken = (payload, secretKey, options = {}) => {
  // Ensure there's a default expiration time if not provided
  if (!options.expiresIn) {
    options.expiresIn = '24h'; // Default expiration time set to 24 hours
  }

  // Generate the JWT token with the given payload, secret, and options
  const token = jwt.sign(payload, secretKey, options);

  return token;
};

export { verifyToken, checkRole,generateToken };
