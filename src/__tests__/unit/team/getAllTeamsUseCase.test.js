const mongoose = require("mongoose");
const userModel = require("../../../models/userModel");
const teamModel = require("../../../models/teamModel");
const inmemoryUserController = require("../../../controllers/in-memory/in-memory-userController");
const inmemoryAuthController = require("../../../controllers/in-memory/in-memory-authController");
const inMemoryTeamController = require("../../../controllers/in-memory/in-memory-teamController");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Get All Teams (Unit Test)", () => {

    beforeAll(async () => {
        await mongoose.connect(MONGO_URl);
        await userModel.deleteMany({});
        await teamModel.deleteMany({});
        await mongoose.connection.close();
    });

    afterAll(async () => {
        await mongoose.connect(MONGO_URl);
        await userModel.deleteMany({});
        await teamModel.deleteMany({});
        await mongoose.connection.close();
    });

    it("should be able to search all teams", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 10",
            password: "6633"
        });

        const user2 = await inmemoryUserController.createUserController({
            username: "User 4",
            password: "5566"
        });

        const loginUser = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "6633"
        });

        const loginUser2 = await inmemoryAuthController.loginUserController({
            username: user2.res.username,
            password: "5566"
        });

        const { token } = loginUser;

        await inMemoryTeamController.createTeamController({
            teamName: "Team 8",
            userId: user.res._id,
            token: token
        });

        await inMemoryTeamController.createTeamController({
            teamName: "Team 9",
            userId: user2.res._id,
            token: loginUser2.token
        });

        const searchTeam = await inMemoryTeamController.getAllTeamsController(token);

        expect(searchTeam.length).toBe(2);

        await mongoose.connection.close();
    });

    it("Should not be able to search all teams, if 'token' isn't valid", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 2",
            password: "7744"
        });

        const user2 = await inmemoryUserController.createUserController({
            username: "User 5",
            password: "1166"
        });

        const loginUser = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "7744"
        });

        const loginUser2 = await inmemoryAuthController.loginUserController({
            username: user2.res.username,
            password: "1166"
        });

        const { token } = loginUser;

        await inMemoryTeamController.createTeamController({
            teamName: "Team 1",
            userId: user.res._id,
            token: token
        });

        await inMemoryTeamController.createTeamController({
            teamName: "Team 2",
            userId: user2.res._id,
            token: loginUser2.token
        });

        const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDQxOTd";

        await expect(
            inMemoryTeamController.getAllTeamsController(fakeToken)

        ).rejects.toEqual(Error("Invalid Token !"));

        await mongoose.connection.close();
    });

});