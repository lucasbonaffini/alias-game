require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../../models/userModel");
const { signToken } = require("../../utils/jwt");
const inMemoryAuthenticateToken = require("../../middlewares/in-memory/in-memory-authenticateToken");

const inmemoryAuthController = {

    async createAdminController(datas)  {
        
        const username = datas.username;
        const password = datas.password;

        if(datas.username === "" || datas.password === "") {
            throw new Error("The fields must have a value !");
    
        }else if(typeof(datas.username) !== "string" || typeof(datas.password) !== "string") {
            throw new Error("The fileds must be a string !");
    
        }else {

            const existingUser = await User.findOne({ username });

            if (existingUser) {
                return { message: 'User already exists' };
            }

            const checkToken = await inMemoryAuthenticateToken(datas.token);
            
            if(checkToken === true) {

                const hashedPassword = await bcrypt.hash(password, 10);

                const newAdmin = new User({
                    username,
                    password: hashedPassword,
                    role: 'admin'
                });

                await newAdmin.save();

                const token = signToken(
                    { id: newAdmin._id, username: newAdmin.username },
                    process.env.JWT_SECRET,
                    "1h",
                );

                return {
                    message: 'Admin created successfully',
                    _id: newAdmin._id,
                    username: newAdmin.username,
                    gamesPlayed: newAdmin.gamesPlayed,
                    gamesWon: newAdmin.gamesWon,
                    currentGame: newAdmin.currentGame,
                    team: newAdmin.team,
                    role: newAdmin.role,
                    adminToken: token
                };
            }
        }
    },

    async loginUserController(datas) {

        if(datas.username === "" || datas.password === "") {
            throw new Error("The fields must have a value !");
      
        }else if(typeof(datas.username) !== "string" || typeof(datas.password) !== "string") {
          throw new Error("The fileds must be a string !");
      
        }else {
      
          const username = datas.username;
          const user = await User.findOne({ username });
          
          if(!user) {
            throw new Error("Invalid credentials");
          }
      
          const isMatch = await bcrypt.compare(datas.password, user.password);

          if(!isMatch) {
            throw new Error("Invalid credentials");
          }
      
          const token = signToken(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            "1h",
          );
      
          return { message: "Logged in", token, id: user._id };
      
        }
    }

}

module.exports = inmemoryAuthController;
