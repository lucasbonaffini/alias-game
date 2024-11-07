const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../../app");
const userModel = require("../../../models/userModel");
const teamModel = require("../../../models/teamModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Get All Teams Controller", () => {

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

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 1",
            password: "6644"
        });

        const loginUser = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "6644"
        });

        const { token } = loginUser.body;

        await request(app).post("/api/teams/").send({
            teamName: "Team 1",
            userId: user._id

        }).set({
            authorization: `Bearer ${token}`
        });

        const searchAllTeams = await request(app).get("/api/teams/getAllTeams").set({
            authorization: `Bearer ${token}`
        });

        expect(searchAllTeams.status).toBe(200);
    });

    it("Should not be able to search all teams, if 'token' isn't valid", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 4",
            password: "1122"
        });

        const loginUser = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "1122"
        });

        const { token } = loginUser.body;

        await request(app).post("/api/teams/").send({
            teamName: "Team 1",
            userId: user._id

        }).set({
            authorization: `Bearer ${token}`
        });

        const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDQxOTd";

        const searchAllTeams = await request(app).get("/api/teams/getAllTeams").set({
            authorization: `Bearer ${fakeToken}`
        });

        expect(searchAllTeams.body).toStrictEqual({ message: 'Invalid token', error: {}  });
        expect(searchAllTeams.status).toBe(403);

        await mongoose.connection.close();
    });

});
