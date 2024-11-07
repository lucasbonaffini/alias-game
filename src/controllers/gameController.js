const Game = require("../models/gameModel");
const User = require("../models/userModel");

const gameService = require("../services/gameService");
const io = require("../services/socketService");

//Game CRUD
const createGame = async (req, res) => {
  const { firstPlayerId } = req.body;

  // Check if the firstPlayerId is provided
  if (!firstPlayerId) {
    return res
      .status(400)
      .json({ message: "firstPlayerId is required to create a game" });
  }

  try {
    const game = await gameService.createGame(firstPlayerId);
    res
      .status(201)
      .json({ message: "New game created", gameId: game._id, game });
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ message: "Failed to create game" });
  }
};

const getGameById = async (req, res) => {
  const { gameId } = req.params;

  try {
    const game = await gameService.getGameById(gameId);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    res.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ message: "Error fetching game" });
  }
};

const getAllGames = async (req, res) => {
  try {
    const games = await gameService.getAllGames();
    return res.status(200).json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ message: "Error fetching games" });
  }
};

const deleteGameById = async (req, res) => {
  const { gameId } = req.params;

  const findGameById = await gameService.getSpecificGame(gameId);

  if (!findGameById) {
    return res.status(404).json({ message: "Game Not Found !" });
  }

  await gameService.deleteGame(gameId);
  return res.status(200).json({ message: "Game Deleted with sucess !" });
};

//Game logic

//join a game
const joinGame = async (req, res) => {
  const { userId } = req.body;

  try {
    //check if the player is already in another game in progress
    const allGames = await Game.find({ status: "in progress" }).populate(
      "teams",
    );
    const otherGameInProgress = allGames.find(
      (game) =>
        game.status === "in progress" &&
        game.teams.some((team) => team.players.includes(userId)),
    );

    if (otherGameInProgress) {
      return res.status(400).json({
        message: "Player is already in another game in progress",
        gameId: otherGameInProgress._id,
        teamId: otherGameInProgress.teams.find((team) =>
          team.players.includes(userId),
        )?._id,
      });
    }

    // find a game that is waiting for players
    let game = await Game.findOne({ status: "waiting" }).populate("teams");
    if (!game) {
      //if there is no game waiting, create a new one
      game = await gameService.createGame(userId);

      return res.status(201).json({
        message:
          "You're the first player to join. A new game has been created.",
        gameId: game._id,
        teamId: game.teams[0]._id,
      });
    }

    //get the teams of the game
    const teams = game.teams;

    if (!teams || teams.length < 2) {
      return res.status(500).json({ error: "No teams available to join" });
    }

    //check if the player is already in a team
    const isPlayerInTeam = teams.some((team) => team.players.includes(userId));
    if (isPlayerInTeam) {
      return res.status(400).json({
        message: "Player is already in a team in this game",
        gameId: game._id,
        teamId: teams.find((team) => team.players.includes(userId))?._id,
      });
    }

    //join the player to the team with less players
    const teamToJoin =
      teams[0].players.length <= teams[1].players.length ? teams[0] : teams[1];

    //add the user to the team
    teamToJoin.players.push(userId);
    await teamToJoin.save();

    //update the user's current game and team
    await User.findByIdAndUpdate(userId, {
      currentGame: game._id,
      team: teamToJoin._id,
    });

    //Change game status to 'in progress' if both teams have 4 players
    if (teams[0].players.length === 4 && teams[1].players.length === 4) {
      console.log("Both teams have 4 players. Game in progress");
      game.status = "in progress";
      await game.save();
      io.emit("startGame", game);
    }

    return res.status(200).json({
      gameId: game._id,
      message: "User joined the game",
      teamId: teamToJoin._id,
    });
  } catch (error) {
    console.error("Error joining game:", error);
    return res.status(500).json({ error: "Failed to join game" });
  }
};

//end turn
const endTurn = async (req, res) => {
  try {
    const { gameId } = req.params;
    const result = await gameService.nextTurn(gameId);

    console.log("Result:", result);
    if (result.isTie) {
      io.emit("endGame", result);
      return res.json({
        message: "The game ended in a tie.",
        game: result, // Puedes incluir información adicional aquí
      });
    }

    // Verificar si el juego ha terminado con un ganador
    if (result.winnerTeam) {
      io.emit("endGame", result);
      return res.json({
        message: "Game completed, we have a winner!",
        winner: result.winnerTeam, // Información del equipo ganador
      });
    }

    // Si el juego sigue en progreso, devolver el estado actualizado
    if (result.status === "in progress") {
      io.emit("turnChanged", { ...result, gameId: result._id });
      return res.json({
        message: "Turn ended, next team's turn and describer updated",
        game: result,
      });
    }
  } catch (error) {
    console.error("Error ending turn:", error);
    res
      .status(500)
      .json({ message: "Error ending turn", error: error.message });
  }
};

module.exports = {
  createGame,
  joinGame,
  getGameById,
  deleteGameById,
  endTurn,
  getAllGames,
};
