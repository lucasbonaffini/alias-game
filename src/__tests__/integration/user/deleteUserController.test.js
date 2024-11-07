const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../../app");
const userModel = require("../../../models/userModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Delete User Controller", () => {

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

    it("should be able to delete a user", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 21",
            password: "4444"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "4444"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 12",
            password: "3322"

        }).set({
            authorization: `Bearer ${token}`
        });

        const { adminToken } = createUserAdmin.body;

        const deleteUser = await request(app).delete("/api/users/deleteUser").query({
            user_id: user.body.user._id

        }).set({
            authorization: `Bearer ${adminToken}`
        });

        expect(deleteUser.body).toStrictEqual({ message: "User deleted with sucess !" });
        expect(deleteUser.status).toBe(200);

        await mongoose.connection.close();
    });

    it("shouldn't be able to delete a user, if 'user_id' is wrong", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 22",
            password: "4798"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "4798"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 23",
            password: "9922"

        }).set({
            authorization: `Bearer ${token}`
        });

        const { adminToken } = createUserAdmin.body;

        const fakeId = "6708a78c0893fdb73078d4ea";

        const deleteUser = await request(app).delete("/api/users/deleteUser").query({
            user_id: fakeId

        }).set({
            authorization: `Bearer ${adminToken}`
        });

        expect(deleteUser.body).toStrictEqual({ message: "User not found !" });
        expect(deleteUser.status).toBe(404);

        await mongoose.connection.close();
    });

    it("shouldn't be able to delete a user, if the token isn't a 'adminToken'", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 24",
            password: "4545"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "4545"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 25",
            password: "8899"

        }).set({
            authorization: `Bearer ${token}`
        });

        const deleteUser = await request(app).delete("/api/users/deleteUser").query({
            user_id: createUserAdmin.body._id

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(deleteUser.body).toStrictEqual({ message: "Access denied, administrator role required" });
        expect(deleteUser.status).toBe(403);

        await mongoose.connection.close();
    });

});