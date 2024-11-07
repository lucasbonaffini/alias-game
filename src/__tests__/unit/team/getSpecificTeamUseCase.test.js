const mongoose = require("mongoose");
const userModel = require("../../../models/userModel");
const teamModel = require("../../../models/teamModel");
const inmemoryUserController = require("../../../controllers/in-memory/in-memory-userController");
const inmemoryAuthController = require("../../../controllers/in-memory/in-memory-authController");
const inMemoryTeamController = require("../../../controllers/in-memory/in-memory-teamController");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Get Specific Team (Unit Test)", () => {

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

    it("should be able to search a specific team", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 1",
            password: "6644"
        });

        const loginUser = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "6644"
        });

        const { token } = loginUser;

        const createTeam = await inMemoryTeamController.createTeamController({
            teamName: "Team 1",
            userId: user.res._id,
            token: token
        });

        const searchTeam = await inMemoryTeamController.getSpecificTeamController({
            team_id: createTeam._id,
            token: token
        });

        expect(searchTeam.teamName).toEqual("Team 1");
        expect(searchTeam).toHaveProperty("players");

        await mongoose.connection.close();
    });

    it("Should not be able to search a team, if 'team_id' is wrong", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 2",
            password: "8899"
        });

        const loginUser = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "8899"
        });

        const { token } = loginUser;

        await inMemoryTeamController.createTeamController({
            teamName: "Team 1",
            userId: user.res._id,
            token: token
        });

        const fakeID = "670419ddced1765a83092133";

        await expect(
            inMemoryTeamController.getSpecificTeamController({
                team_id: fakeID,
                token: token
            })

        ).rejects.toEqual(Error("Team Not Found !"));

        await mongoose.connection.close();
    });

    it("Should not be able to search a team, if 'token' isn't valid", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 8",
            password: "1122"
        });

        const loginUser = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "1122"
        });

        const { token } = loginUser;

        const createTeam = await inMemoryTeamController.createTeamController({
            teamName: "Team 1",
            userId: user.res._id,
            token: token
        });

        const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDQxOTd";

        await expect(
            inMemoryTeamController.getSpecificTeamController({
                team_id: createTeam._id,
                token: fakeToken
            })

        ).rejects.toEqual(Error("Invalid Token !"));

        await mongoose.connection.close();
    });

});