const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../../app");
const userModel = require("../../../models/userModel");
const teamModel = require("../../../models/teamModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Create Team Controller", () => {

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

    it("Should be possible to create a team, if there is a valid user with a valid token", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 1",
            password: "1234"
        });

        const loginUser = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "1234"
        });

        const { token } = loginUser.body;

        const createTeam =  await request(app).post("/api/teams/").send({
            teamName: "Team 1",
            userId: user._id

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(createTeam.body.teamName).toEqual("Team 1");
        expect(createTeam.body).toHaveProperty("players");
        expect(createTeam.status).toBe(201);

        await mongoose.connection.close();
    });

    it("Should not be able to create a team, if 'TeamName' field not be string", async () => {

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

        const createTeam =  await request(app).post("/api/teams/").send({
            teamName: 8899,
            userId: user._id

        }).set({
            authorization: `Bearer ${token}`
        });


        expect(createTeam.body).toStrictEqual({ message: 'The teamName field must be a string !' });
        expect(createTeam.status).toBe(401);

        await mongoose.connection.close();
    });

    it("Should not be able to create a team, if user already have a team", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 3",
            password: "5588"
        });

        const loginUser = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "5588"
        });

        const { token } = loginUser.body;

        await request(app).post("/api/teams/").send({
            teamName: "Team 1",
            userId: user._id

        }).set({
            authorization: `Bearer ${token}`
        });

        const createTeam2 =  await request(app).post("/api/teams/").send({
            teamName: "Team 1",
            userId: user._id

        }).set({
            authorization: `Bearer ${token}`
        });


        expect(createTeam2.body).toStrictEqual({ message: 'User already have a team !' });
        expect(createTeam2.status).toBe(401);

        await mongoose.connection.close();
    });


    it("Should not be able to create a team, if 'token' isn't valid", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 4",
            password: "1122"
        });
        
        const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDQxOTd";

        const createTeam = await request(app).post("/api/teams/").send({
            teamName: "Team 1",
            userId: user._id

        }).set({
            authorization: `Bearer ${fakeToken}`
        });

        expect(createTeam.body).toStrictEqual({ message: 'Invalid token', error: {}  });
        expect(createTeam.status).toBe(403);

        await mongoose.connection.close();
    });

});
