const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../../app");
const userModel = require("../../../models/userModel");
const teamModel = require("../../../models/teamModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Update Specific Team Field Controller", () => {

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

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 1",
            password: "6644"
        });

        const loginUser = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "6644"
        });

        const { token } = loginUser.body;

        const createTeam = await request(app).post("/api/teams/").send({
            teamName: "Team 1",
            userId: user._id

        }).set({
            authorization: `Bearer ${token}`
        });

        const updateTeamField = await request(app).patch("/api/teams/updateSpecificTeamField").send({
            teamName: "Team 11"

        }).query({
            team_id: createTeam.body._id

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(updateTeamField.body.teamName).toEqual("Team 11");
        expect(updateTeamField.body).toHaveProperty("players");
        expect(updateTeamField.status).toBe(201);
    });

    it("Should not be able to a update a specific team field, if 'TeamName' field not be a string", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 2",
            password: "4466"
        });

        const loginUser = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "4466"
        });

        const { token } = loginUser.body;

        const createTeam = await request(app).post("/api/teams/").send({
            teamName: "Team 2",
            userId: user._id

        }).set({
            authorization: `Bearer ${token}`
        });

        const updateTeamField = await request(app).patch("/api/teams/updateSpecificTeamField").send({
            teamName: 8899

        }).query({
            team_id: createTeam.body._id

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(updateTeamField.body).toStrictEqual({ message: 'The teamName field must be a string !' });
        expect(updateTeamField.status).toBe(401);

        await mongoose.connection.close();
    });

    it("Should not be able to a update a specific team field, if 'team_id' is wrong", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 9",
            password: "4466"
        });

        const loginUser = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "4466"
        });

        const { token } = loginUser.body;

        await request(app).post("/api/teams/").send({
            teamName: "Team 2",
            userId: user._id

        }).set({
            authorization: `Bearer ${token}`
        });

        const fakeID = "670419ddced1765a83092133";

        const updateTeamField = await request(app).patch("/api/teams/updateSpecificTeamField").send({
            teamName: "Team 8"

        }).query({
            team_id: fakeID

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(updateTeamField.body).toStrictEqual({ message: 'Team Not Found !' });
        expect(updateTeamField.status).toBe(404);

        await mongoose.connection.close();
    });


    it("Should not be able to update a team, if 'token' isn't valid", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 4",
            password: "1122"
        })

        const loginUser = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "1122"
        })

        const { token } = loginUser.body;

        const createTeam = await request(app).post("/api/teams/").send({
            teamName: "Team 1",
            userId: user._id

        }).set({
            authorization: `Bearer ${token}`
        });

        const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDQxOTd";

        const searchTeam = await request(app).get("/api/teams/searchTeam").query({
            team_id: createTeam.body_id

        }).set({
            authorization: `Bearer ${fakeToken}`
        });

        expect(searchTeam.body).toStrictEqual({ message: 'Invalid token', error: {}  });
        expect(searchTeam.status).toBe(403);

        await mongoose.connection.close();
    });

});
