const Game = require('../../../models/gameModel');
const Team = require('../../../models/teamModel');
const userService = require("../../../services/userService"); 
const GameService = require('../../../services/gameService');
const TeamService = require("../../../services/teamService");
const WordService = require('../../../services/wordService');
const wordService = new WordService();

jest.mock('../../../models/gameModel'); 
jest.mock('../../../models/teamModel'); 
jest.mock('../../../services/wordService'); 
jest.mock("../../../services/teamService");
jest.mock("../../../services/userService");

describe('GameService', () => {
  describe('getGameById', () => {
    it('should return a game with populated teams and players', async () => {
      const mockGame = {
        _id: "game123",
        teams: [
          {
            _id: "team1",
            players: [
              { _id: "player1", username: "user1" },
              { _id: "player2", username: "user2" },
            ],
          },
        ],
      };

      Game.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockGame),
      }));

      const game = await GameService.getGameById("game123");
      expect(game).toEqual(mockGame);
      expect(Game.findById).toHaveBeenCalledWith("game123");
    });
  });

  describe('getSpecificGame', () => {
    it('should return a game by ID', async () => {
      const mockGame = {
        _id: "game123",
        status: "in progress",
      };

      Game.findById.mockResolvedValue(mockGame);

      const game = await GameService.getSpecificGame("game123");
      expect(game).toEqual(mockGame);
      expect(Game.findById).toHaveBeenCalledWith("game123");
    });
  });

  describe('deleteGame', () => {
    it('should delete a game by ID', async () => {
      Game.deleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });

      await GameService.deleteGame("game123");
      expect(Game.deleteOne).toHaveBeenCalledWith({ _id: "game123" });
    });
  });

  describe('getAllGames', () => {
    it('should return all games', async () => {
      const mockGames = [
        { _id: "game123", status: "in progress" },
        { _id: "game124", status: "finished" },
      ];

      Game.find.mockResolvedValue(mockGames);

      const games = await GameService.getAllGames();
      expect(games).toEqual(mockGames);
      expect(Game.find).toHaveBeenCalled();
    });
  });

  describe('createGame', () => {
    it('should create a game with the first player', async () => {
        const mockWord = "mockedWord";
        const firstPlayerId = "player1";
  
        Team.create.mockImplementation((team) => {
          return {
            _id: "teamId",
            ...team
          };
        });

        wordService.generateWord.mockResolvedValue(mockWord);  

        Game.create.mockImplementation((gameData) => {
            return Promise.resolve({
              _id: "gameId",
              teams: gameData.teams, // Asegúrate de incluir esto
              rounds: gameData.rounds,
              currentRound: gameData.currentRound,
              status: gameData.status,
              currentTurnTeam: gameData.currentTurnTeam,
              currentWord: gameData.currentWord, // Asegúrate de incluir esto
              currentDescriber: gameData.currentDescriber,
            });
          });
          
  
        const game = await GameService.createGame(firstPlayerId);
  
        expect(game).toHaveProperty('teams');
        expect(game.teams).toHaveLength(2);
        expect(game.currentDescriber).toBe(firstPlayerId);
      });

    it('should throw an error if firstPlayerId is not provided', async () => {
      await expect(GameService.createGame()).rejects.toThrow("firstPlayerId is required to create a game");
    });
  });

  describe('verifyGameProgress', () => {
    it('should return a game if it is in progress', async () => {
      const mockGame = {
        _id: "game123",
        status: "in progress",
      };

      Game.findById.mockResolvedValue(mockGame);

      const game = await GameService.verifyGameProgress("game123");
      expect(game).toEqual(mockGame);
      expect(Game.findById).toHaveBeenCalledWith("game123");
    });

    it('should throw an error if game is not found', async () => {
      Game.findById.mockResolvedValue(null);
      await expect(GameService.verifyGameProgress("invalidId")).rejects.toThrow("Game not found");
    });

    it('should throw an error if game is not in progress', async () => {
      const mockGame = {
        _id: "game123",
        status: "finished",
      };

      Game.findById.mockResolvedValue(mockGame);
      await expect(GameService.verifyGameProgress("game123")).rejects.toThrow("Game is not in progress or already finished");
    });
  });

  describe("updateUserGameStats", () => {
    it("should update user stats for all users in the team", async () => {
      const teamId = "team1";
      const mockUsers = [{ _id: "user1" }, { _id: "user2" }];

      // Mock de TeamService.getUsersByTeamId
      TeamService.getUsersByTeamId.mockResolvedValue(mockUsers);

      // Mock de userService.updateUserStats
      userService.updateUserStats.mockResolvedValue();

      await GameService.updateUserGameStats(teamId);

      expect(TeamService.getUsersByTeamId).toHaveBeenCalledWith(teamId);
      expect(userService.updateUserStats).toHaveBeenCalledTimes(mockUsers.length);
      expect(userService.updateUserStats).toHaveBeenCalledWith("user1");
      expect(userService.updateUserStats).toHaveBeenCalledWith("user2");
    });
  });

  describe("updateCurrentGameAndTeam", () => {
    it("should update user current game and team for all users in the team", async () => {
      const teamId = "team1";
      const mockUsers = [{ _id: "user1" }, { _id: "user2" }];

      // Mock de TeamService.getUsersByTeamId
      TeamService.getUsersByTeamId.mockResolvedValue(mockUsers);

      // Mock de userService.updateUserCurrentGameAndTeam
      userService.updateUserCurrentGameAndTeam.mockResolvedValue();

      await GameService.updateCurrentGameAndTeam(teamId);

      expect(TeamService.getUsersByTeamId).toHaveBeenCalledWith(teamId);
      expect(userService.updateUserCurrentGameAndTeam).toHaveBeenCalledTimes(mockUsers.length);
      expect(userService.updateUserCurrentGameAndTeam).toHaveBeenCalledWith("user1");
      expect(userService.updateUserCurrentGameAndTeam).toHaveBeenCalledWith("user2");
    });
  });

  describe('getCurrentWord', () => {
    it('should return the current word for a given game', async () => {
      const gameId = 'game123';
      const mockWord = 'mockedWord';
      const mockGame = { currentWord: mockWord };

      Game.findById.mockResolvedValue(mockGame);

      const currentWord = await GameService.getCurrentWord(gameId);

      expect(Game.findById).toHaveBeenCalledWith(gameId);
      expect(currentWord).toBe(mockWord);
    });

    it('should throw an error if the game is not found', async () => {
      const gameId = 'nonExistingGame';

      Game.findById.mockResolvedValue(null);

      await expect(GameService.getCurrentWord(gameId)).rejects.toThrow('Game not found');
    });
  });

  describe('determineWinner', () => {
    it('should determine the winner if the game is finished', async () => {
      const gameId = 'game123';
      const mockTeams = [
        { _id: 'team1', score: 5, teamName: 'Team 1' },
        { _id: 'team2', score: 3, teamName: 'Team 2' }
      ];
      const mockGame = {
        _id: gameId,
        status: 'finished',
        teams: mockTeams
      };

      Game.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockGame),
      });

      const result = await GameService.determineWinner(gameId);

      expect(Game.findById).toHaveBeenCalledWith(gameId);
      expect(result.isTie).toBe(false);
      expect(result.winnerTeam).toBe(mockTeams[0]);
    });

    it('should return a tie if both teams have the same score', async () => {
      const gameId = 'game123';
      const mockTeams = [
        { _id: 'team1', score: 5, teamName: 'Team 1' },
        { _id: 'team2', score: 5, teamName: 'Team 2' }
      ];
      const mockGame = {
        _id: gameId,
        status: 'finished',
        teams: mockTeams
      };

      Game.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockGame),
      });

      const result = await GameService.determineWinner(gameId);

      expect(Game.findById).toHaveBeenCalledWith(gameId);
      expect(result.isTie).toBe(true);
      expect(result.message).toBe("It's a tie!");
    });

    it('should throw an error if the game is not finished', async () => {
      const gameId = 'game123';
      const mockGame = {
        status: 'in progress',
        teams: []
      };

      Game.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockGame),
      });

      await expect(GameService.determineWinner(gameId)).rejects.toThrow('Game is not finished yet');
    });

    it('should throw an error if the game is not found', async () => {
      const gameId = 'nonExistingGame';

      Game.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(GameService.determineWinner(gameId)).rejects.toThrow('Game not found');
    });
  });
});
