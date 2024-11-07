const { verifyToken } = require("../utils/jwt");
const authController = require("../controllers/authController");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing." });
  }

  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access token missing" });

  try {
    const user = verifyToken(token);

    const validUser = await authController.findUserById(user.id);
    if (!validUser) {
      return res.status(401).json({ message: "Invalid user" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token", error });
  }
};

const isAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  // Check if authHeader is present and in the correct format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing or malformed" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access token missing" });

  try {
    const user = verifyToken(token);

    const validUser = await authController.findUserById(user.id);
    if (!validUser) {
      return res.status(401).json({ message: "Invalid user" });
    }

    if (validUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, administrator role required' });
    }

    next();

  } catch (error) {
    console.error('Error verifying token or fetching user:', error);
    return res.status(500).json({ message: 'Error verifying token or fetching user', error });
  }
};


module.exports = { authenticateToken, isAdmin };
