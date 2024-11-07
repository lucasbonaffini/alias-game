const { Router } = require('express');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

const router = Router();

// Create User Admin
router.post('/createAdmin', authenticateToken, async (req, res, next) => {
  try {
    await authController.createAdminController(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

// Login route
router.post('/login', async (req, res, next) => {
  try {
    await authController.loginUserController(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

// Protected route test
router.get('/protected', authenticateToken, (req, res, next) => {
  try {
    res.json({ message: 'This is a protected route', user: req.user });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

// Admin route test
router.get('/admin', authenticateToken, isAdmin, (req, res, next) => {
  try {
    res.json({ message: 'This is an admin route', user: req.user });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

module.exports = router;

