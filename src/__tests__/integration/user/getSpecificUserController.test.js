const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../../app");
const userModel = require("../../../models/userModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Get Specific User Controller", () => {

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

    it("should be able to search a User", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 1",
            password: "9988"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "9988"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 2",
            password: "1267"

        }).set({
            authorization: `Bearer ${token}`
        });

        const { adminToken } = createUserAdmin.body;

        const getUser = await request(app).get("/api/users/getSpecificUser").query({
            user_id: user.body.user._id

        }).set({
            authorization: `Bearer ${adminToken}`
        });

        expect(getUser.body.username).toEqual("User 1");
        expect(getUser.body).toHaveProperty("gamesPlayed");
        expect(getUser.body).toHaveProperty("gamesWon");
        expect(getUser.status).toBe(200);

        await mongoose.connection.close();
    });

    it("shouldn't be able to search a User, if 'user_id' is wrong", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 3",
            password: "1199"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "1199"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 4",
            password: "6644"

        }).set({
            authorization: `Bearer ${token}`
        });

        const { adminToken } = createUserAdmin.body;

        const fakeId = "6708a78c0893fdb73078d4ea";

        const getUser = await request(app).get("/api/users/getSpecificUser").query({
            user_id: fakeId

        }).set({
            authorization: `Bearer ${adminToken}`
        });

        expect(getUser.body).toStrictEqual({ message: "User not found !" });
        expect(getUser.status).toBe(404);

        await mongoose.connection.close();
    });

    it("shouldn't be able to search a User, if the token isn't a 'adminToken'", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 5",
            password: "4545"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "4545"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 6",
            password: "8899"

        }).set({
            authorization: `Bearer ${token}`
        });

        const getUser = await request(app).get("/api/users/getSpecificUser").query({
            user_id: createUserAdmin.body._id

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(getUser.body).toStrictEqual({ message: "Access denied, administrator role required" });
        expect(getUser.status).toBe(403);

        await mongoose.connection.close();
    });

});