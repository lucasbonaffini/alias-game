const userModel = require("../models/userModel");

const createUser = async (datas) => {

    const user = {
        username: datas.username,
        password: datas.password
    }

    const createUser = await userModel.create(user);
    return createUser;
};

const getSpecificUser = async (user_id) => {
    const find = await userModel.findOne({
        _id: user_id
    });

    return find;
};

const getAllUsers = async () => {
    const users = await userModel.find();
    return users;
}

const updateUserField = async (user_id, gamesPlayed) => {
    const update = await userModel.findById(user_id);
    update.gamesPlayed = gamesPlayed;
    const res = await update.save();
    return res;
};

const deleteUser = async (user_id) => {
    await userModel.deleteOne({
        _id: user_id
    });
};

const findUserByUsername = async (username) => {
    const find = await userModel.findOne({
        username: username
    });
    return find;
};

const findUserById = async (user_id) => {

    const find = await userModel.findOne({
        _id: user_id
    });

    return find;
};

//new
const updateUserStats = async (userId) => {
    const user = await userModel.findById(userId);
    if (user) {
        user.gamesPlayed += 1;
        user.gamesWon += 1;
        await user.save();
    }
    console.log(`from user model ${user.gamesPlayed}, ganados ${user.gamesWon}`);
}

const updateUserCurrentGameAndTeam = async (userId) => {
    await userModel.findByIdAndUpdate(userId, {
        currentGame: null,
        team: null
    });
}

module.exports = {
    createUser,
    getAllUsers,
    getSpecificUser,
    updateUserField,
    deleteUser,
    findUserByUsername,
    findUserById,
    updateUserStats,
    updateUserCurrentGameAndTeam,
}

