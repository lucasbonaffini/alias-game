const mongoose = require("mongoose");
const userModel = require("../../../models/userModel");
const teamModel = require("../../../models/teamModel");
const inmemoryUserController = require("../../../controllers/in-memory/in-memory-userController");
const inmemoryAuthController = require("../../../controllers/in-memory/in-memory-authController");
const inMemoryTeamController = require("../../../controllers/in-memory/in-memory-teamController");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Update Specific Team Field (Unit Test)", () => {

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

    it("should be able to search a update a specific team field", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 4",
            password: "1133"
        });

        const loginUser = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "1133"
        });

        const { token } = loginUser;

        const createTeam = await inMemoryTeamController.createTeamController({
            teamName: "Team 1",
            userId: user.res._id,
            token: token
        });

        const updateSpecificTeamField = await inMemoryTeamController.updateSpecificTeamFieldController({
            teamName: "Team 11",
            team_id: createTeam._id,
            token: token
        });

        expect(updateSpecificTeamField.teamName).toEqual("Team 11");
        expect(updateSpecificTeamField).toHaveProperty("players");

        await mongoose.connection.close();
    });

    it("Should not be able to a update a specific team field, if 'TeamName' field not be a string", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 9",
            password: "4444"
        });

        const loginUser = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "4444"
        });

        const { token } = loginUser;

        const createTeam = await inMemoryTeamController.createTeamController({
            teamName: "Team 2",
            userId: user.res._id,
            token: token
        });

        await expect(
            inMemoryTeamController.updateSpecificTeamFieldController({
                teamName: 449988,
                team_id: createTeam._id,
                token: token
            })

        ).rejects.toEqual(Error("The teamName filed must be a string !"));

        await mongoose.connection.close();
    });

    it("Should not be able to a update a specific team field, if 'team_id' is wrong", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 7",
            password: "1166"
        });

        const loginUser = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "1166"
        });

        const { token } = loginUser;

        await inMemoryTeamController.createTeamController({
            teamName: "Team 9",
            userId: user.res._id,
            token: token
        });

        const fakeID = "670419ddced1765a83092133";

        await expect(
            inMemoryTeamController.updateSpecificTeamFieldController({
                teamName: "Team 10",
                team_id: fakeID,
                token: token
            })

        ).rejects.toEqual(Error("Team Not Found !"));

        await mongoose.connection.close();
    });

    it("Should not be able to update a team, if 'token' isn't valid", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 1",
            password: "7788"
        });

        const loginUser = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "7788"
        });

        const { token } = loginUser;

        const createTeam = await inMemoryTeamController.createTeamController({
            teamName: "Team 9",
            userId: user.res._id,
            token: token
        });

        const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDQxOTd";

        await expect(
            inMemoryTeamController.updateSpecificTeamFieldController({
                teamName: "Team 10",
                team_id: createTeam._id,
                token: fakeToken
            })

        ).rejects.toEqual(Error("Invalid Token !"));

        await mongoose.connection.close();
    });

});