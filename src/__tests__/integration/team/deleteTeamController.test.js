const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../../app");
const userModel = require("../../../models/userModel");
const teamModel = require("../../../models/teamModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Delete Team Controller", () => {

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

    it("should be able to delete a specific team", async () => {

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

        const deleteTeam = await request(app).delete("/api/teams/deleteTeam").query({
            team_id: createTeam.body._id

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(deleteTeam.body).toStrictEqual({ message: "Team Deleted with sucess !" });
        expect(deleteTeam.status).toBe(200);
    });

    it("Should not be able to delete a team, if 'team_id' is wrong", async () => {

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

        await request(app).post("/api/teams/").send({
            teamName: "Team 2",
            userId: user._id

        }).set({
            authorization: `Bearer ${token}`
        });

        const fakeID = "670419ddced1765a83092133";

        const deleteTeam = await request(app).delete("/api/teams/deleteTeam").query({
            team_id: fakeID

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(deleteTeam.body).toStrictEqual({ message: "Team Not Found !" });
        expect(deleteTeam.status).toBe(404);

        await mongoose.connection.close();
    });


    it("Should not be able to delete a team, if 'token' isn't valid", async () => {

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

        const deleteTeam = await request(app).delete("/api/teams/deleteTeam").query({
            team_id: createTeam.body._id

        }).set({
            authorization: `Bearer ${fakeToken}`
        });

        expect(deleteTeam.body).toStrictEqual({ message: 'Invalid token', error: {}  });
        expect(deleteTeam.status).toBe(403);

        await mongoose.connection.close();
    });

});
