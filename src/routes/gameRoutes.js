const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");
const { authenticateToken, isAdmin } = require("../middlewares/authMiddleware");

// game CRUD
router.post("/create", authenticateToken, async (req, res, next) => {
  try {
    await gameController.createGame(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

router.get("/:gameId", authenticateToken, async (req, res, next) => {
  try {
    await gameController.getGameById(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

router.get("/", authenticateToken, isAdmin, async (req, res, next) => {
  try {
    await gameController.getAllGames(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

router.delete("/:gameId", authenticateToken, isAdmin, async (req, res, next) => {
  try {
    await gameController.deleteGameById(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

// to play the game
router.post("/join", authenticateToken, async (req, res, next) => {
  try {
    await gameController.joinGame(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

router.post("/:gameId/endTurn", authenticateToken, async (req, res, next) => {
  try {
    await gameController.endTurn(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

module.exports = router;

