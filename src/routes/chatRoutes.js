const { Router } = require("express");
const controller = require("../controllers/chatController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    await controller.listAllChats(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

router.get("/:chatId", async (req, res, next) => {
  try {
    await controller.getChatById(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

router.post("/", authenticateToken, async (req, res, next) => {
  try {
    await controller.createChat(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

router.put("/:chatId", authenticateToken, async (req, res, next) => {
  try {
    await controller.updateChat(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

router.delete("/:chatId", authenticateToken, async (req, res, next) => {
  try {
    await controller.deleteChat(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});


module.exports = router;

