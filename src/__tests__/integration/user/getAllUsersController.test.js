const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../../app");
const userModel = require("../../../models/userModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Get All Users Controller", () => {

    beforeAll(async () => {
        await mongoose.connect(MONGO_URl);
        await userModel.deleteMany({});
        await mongoose.connection.close();
    });

    afterAll(async () => {
        await mongoose.connect(MONGO_URl);
        await userModel.deleteMany({});
        await mongoose.connection.close();
    });

    it("should be able to get all Users", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 7",
            password: "1111"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "1111"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 8",
            password: "9988"

        }).set({
            authorization: `Bearer ${token}`
        });

        const { adminToken } = createUserAdmin.body;

        const getAllUsers = await request(app).get("/api/users/getAllUsers").set({
            authorization: `Bearer ${adminToken}`
        });

        expect(getAllUsers.status).toBe(200);

        await mongoose.connection.close();
    });

    it("shouldn't be able to get all Users, if the token isn't a 'adminToken'", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 9",
            password: "6688"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "6688"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 10",
            password: "9911"

        }).set({
            authorization: `Bearer ${token}`
        });

        const getAllUsers = await request(app).get("/api/users/getSpecificUser").query({
            user_id: createUserAdmin.body._id

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(getAllUsers.body).toStrictEqual({ message: "Access denied, administrator role required" });
        expect(getAllUsers.status).toBe(403);

        await mongoose.connection.close();
    });

});