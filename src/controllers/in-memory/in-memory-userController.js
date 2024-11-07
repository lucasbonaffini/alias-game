const inMemoryAuthenticateTokenAdmin = require("../../middlewares/in-memory/in-memory-authenticateTokenAdmin")
const userService = require("../../services/userService");;
const { hash } = require("bcryptjs");

const inMemoryUserController = {

    async createUserController(datas) {

        if(datas.username === "" || datas.password === "") {
            throw new Error("The fields must have a value !");
    
        }else if(typeof(datas.username) !== "string" || typeof(datas.password) !== "string") {
            throw new Error("The fileds must be a string !");
    
        }else {

            const existingUser = await userService.findUserByUsername(datas.username);

            if (existingUser) {
                throw new Error("User already exists");
            }

            const hashedPassword = await hash(datas.password, 10);

            const user = await userService.createUser({
                username: datas.username,
                password: hashedPassword
            });

            const res = {
                _id: user._id,
                username: user.username,
                gamesPlayed: user.gamesPlayed,
                gamesWon: user.gamesWon,
                role: user.role,
                __v: user.__v
            }

            const message = "User registered";

            return { message, res };

        } 
    },

    async getSpecificUserController(datas)  {

        const getUser = await userService.getSpecificUser(datas.user_id);
    
        if(!getUser) {
            throw new Error("User not found !");
        }

        const checkToken = await inMemoryAuthenticateTokenAdmin(datas.token);

        if(checkToken === true) {

            return {
                _id: getUser._id,
                username: getUser.username,
                gamesPlayed: getUser.gamesPlayed,
                gamesWon: getUser.gamesWon,
                currentGame: getUser.currentGame,
                team: getUser.team,
                role: getUser.role
            };

        }

    },

    async getAllUsersController(datas)  {

        const checkToken = await inMemoryAuthenticateTokenAdmin(datas.token);

        if(checkToken === true) {
            const users = await userService.getAllUsers();
            return users;
        }
    },
    
    async updateSpecificUserFieldController(datas) {

        if(datas.gamesPlayed === "") {
            throw new Error("The gamesPlayed field must have a value !");
    
        }else if(typeof(datas.gamesPlayed) !== "number") {
            throw new Error("The gamesPlayed field must be a number !");
    
        }else {
            const findUserById = await userService.findUserById(datas.user_id);
    
            if(!findUserById) {
                throw new Error("User not found !");
            }

            const checkToken = await inMemoryAuthenticateTokenAdmin(datas.token);

            if(checkToken === true) {
                
                const update = await userService.updateUserField(datas.user_id, datas.gamesPlayed);
    
                return {
                    _id: update._id,
                    username: update.username,
                    gamesPlayed: update.gamesPlayed,
                    gamesWon: update.gamesWon,
                    currentGame: update.currentGame,
                    team: update.team,
                    role: update.role
                };
            }
    
        }
    },

    
    async deleteUserController(datas) {

        const findUserById = await userService.findUserById(datas.user_id);

        if(!findUserById) {
            throw new Error("User not found !");
        }

        const checkToken = await inMemoryAuthenticateTokenAdmin(datas.token);

        if(checkToken === true) {

            await userService.deleteUser(datas.user_id);

            return { message: "User deleted with sucess !" };

        }
    }

}

module.exports = inMemoryUserController;