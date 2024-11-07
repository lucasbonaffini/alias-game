const express = require('express');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/createUser', async (req, res, next) => {
  try {
    await userController.createUserController(req, res);
  } catch (error) {
    next(error); // Forward the error to the error-handling middleware
  }
});

router.get("/getSpecificUser", authenticateToken, isAdmin, async (req, res, next) => {
  try {
    await userController.getSpecificUserController(req, res);
  } catch (error) {
    next(error); // Forward the error to the error-handling middleware
  }
});

router.get('/getAllUsers', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    await userController.getAllUsersController(req, res);
  } catch (error) {
    next(error); // Forward the error to the error-handling middleware
  }
});

router.patch('/updateUserField', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    await userController.updateSpecificUserFieldController(req, res);
  } catch (error) {
    next(error); // Forward the error to the error-handling middleware
  }
});

router.delete('/deleteUser', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    await userController.deleteUserController(req, res);
  } catch (error) {
    next(error); // Forward the error to the error-handling middleware
  }
});

module.exports = router;
