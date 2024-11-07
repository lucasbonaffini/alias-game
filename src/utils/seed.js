const bcrypt = require("bcryptjs"); 
const User = require("../models/userModel");  
const Team = require("../models/teamModel");
const Game = require("../models/gameModel"); 

const seedDatabase = async () => {
    try {

      // delete all data in the database
      await User.deleteMany({});
      await Team.deleteMany({});
      await Game.deleteMany({});

       // Create an admin user
      const adminPassword = await bcrypt.hash("adminPassword", 10);
      const admin = new User({
        username: "admin",
        email: "admin@example.com",
        password: adminPassword,
        role: "admin",  
      });
      await admin.save();

      // create 8 users
      const users = [];
      for (let i = 1; i <= 8; i++) {

        const password = `password${i}`;
        const hashedPassword = await bcrypt.hash(password, 10);  // Hash the password
  
        const user = new User({
          username: `user${i}`,
          email: `user${i}@example.com`,
          password: hashedPassword,
        });
        await user.save();
        users.push(user);
      }
  
      // create teams
      const team1 = new Team({
        teamName: "Team 1",
        players: users.slice(0, 4).map(user => user._id),
      });
      await team1.save();
  
      const team2 = new Team({
        teamName: "Team 2",
        players: users.slice(4, 8).map(user => user._id),
      });
      await team2.save();
  
      // Create the game and assign the first team as the current turn team and the first user as the describer
      const game = new Game({
        teams: [team1._id, team2._id],  
        rounds: 3,  
        currentRound: 0,
        currentTurnTeam: team1._id,  //the first team is the current turn team
        currentDescriber: users[0]._id,  //the first user is the describer
        currentWord: "example",  
        status: "in progress", 
        describerIndices: { team1: 0, team2: 0 },  
      });
  
      await game.save(); 
      console.log("Database seeded successfully!");
  
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  };
  

module.exports = seedDatabase;
