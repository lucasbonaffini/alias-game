require("dotenv").config();
const bcrypt = require("bcryptjs");
const userService = require("../services/userService");

const createUserController = async (req, res) => {

    const { username, password } = req.body;

    if(username === "" || password === "") {
        return res.status(401).json({ message: "The fields must have a value !" });

    }else if(typeof(username) !== "string" || typeof(password) !== "string") {
        return res.status(401).json({ message:"The fileds must be a string !" });

    }else {

        const existingUser = await userService.findUserByUsername(username);

        if (existingUser) {
            return res.status(401).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userService.createUser({
            username,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "User registered",
            user: {
                username: user.username,
                gamesPlayed: user.gamesPlayed,
                gamesWon: user.gamesWon,
                _id: user._id,
                __v: user.__v
            }
        });
    }

};

const getSpecificUserController = async (req, res) => {

    const { user_id } = req.query;

    const getUser = await userService.getSpecificUser(user_id);

    if(!getUser) {
        return res.status(404).json({ message: "User not found !" });
    }

    return res.status(200).json({
        _id: getUser._id,
        username: getUser.username,
        gamesPlayed: getUser.gamesPlayed,
        gamesWon: getUser.gamesWon,
        currentGame: getUser.currentGame,
        team: getUser.team,
        role: getUser.role
    });

};

const getAllUsersController = async (req, res) => {
    const users = await userService.getAllUsers();
    return res.status(200).json(users);
};

const updateSpecificUserFieldController = async (req, res) => {

    const { gamesPlayed } = req.body;
    const { user_id } = req.query;

    if(gamesPlayed === "") {
        return res.status(401).json({ message: "The gamesPlayed field must have a value !" });

    }else if(typeof(gamesPlayed) !== "number") {
        return res.status(401).json({ message: "The gamesPlayed field must be a number !" });

    }else {
        const findUserById = await userService.findUserById(user_id);

        if(!findUserById) {
            return res.status(404).json({ message: "User not found !" });
        }

        const update = await userService.updateUserField(user_id, gamesPlayed);

        return res.status(201).json({
            _id: update._id,
            username: update.username,
            gamesPlayed: update.gamesPlayed,
            gamesWon: update.gamesWon,
            currentGame: update.currentGame,
            team: update.team,
            role: update.role
        });

    }

};

const deleteUserController = async (req, res) => {

    const { user_id } = req.query;

    const findUserById = await userService.findUserById(user_id);

    if(!findUserById) {
        return res.status(404).json({ message: "User not found !" });
    }

    await userService.deleteUser(user_id);

    return res.status(200).json({ message: "User deleted with sucess !" });
};

module.exports = {
    createUserController,
    getSpecificUserController, 
    getAllUsersController,
    updateSpecificUserFieldController,
    deleteUserController
};