const { Router } = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const teamController = require("../controllers/teamController");

const router = Router();

router.post("/", authenticateToken, async (req, res, next) => {
  try {
    await teamController.createTeamController(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

router.get("/searchTeam", authenticateToken, async (req, res, next) => {
  try {
    await teamController.getSpecificTeamController(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

router.get("/getAllTeams", authenticateToken, async (req, res, next) => {
  try {
    await teamController.getAllTeamsController(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

router.patch("/updateSpecificTeamField", authenticateToken, async (req, res, next) => {
  try {
    await teamController.updateSpecificTeamFieldController(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

router.delete("/deleteTeam", authenticateToken, async (req, res, next) => {
  try {
    await teamController.deleteTeamController(req, res);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

module.exports = router;
