const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../../app");
const userModel = require("../../../models/userModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Update Specific User Field Controller", () => {

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

    it("should be able to update a user field", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 11",
            password: "8822"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "8822"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 12",
            password: "3322"

        }).set({
            authorization: `Bearer ${token}`
        });

        const { adminToken } = createUserAdmin.body;

        const updateUserField = await request(app).patch("/api/users/updateUserField").send({
            gamesPlayed: 8

        }).query({
            user_id: user.body.user._id

        }).set({
            authorization: `Bearer ${adminToken}`
        });

        expect(updateUserField.body.username).toEqual("User 11");
        expect(updateUserField.body.gamesPlayed).toEqual(8);
        expect(updateUserField.body).toHaveProperty("_id");
        expect(updateUserField.body).toHaveProperty("gamesWon");
        expect(updateUserField.status).toBe(201);

        await mongoose.connection.close();
    });

    it("shouldn't be able to update a user field, if the 'gamesPlayed' doesn't have a value", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 13",
            password: "4554"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "4554"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 14",
            password: "6677"

        }).set({
            authorization: `Bearer ${token}`
        });

        const { adminToken } = createUserAdmin.body;

        const updateUserField = await request(app).patch("/api/users/updateUserField").send({
            gamesPlayed: ""

        }).query({
            user_id: user.body.user._id

        }).set({
            authorization: `Bearer ${adminToken}`
        });

        expect(updateUserField.body).toStrictEqual({ message: "The gamesPlayed field must have a value !" });
        expect(updateUserField.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to update a user field, if the 'gamesPlayed' isn't a number", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 15",
            password: "3443"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "3443"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 16",
            password: "9911"

        }).set({
            authorization: `Bearer ${token}`
        });

        const { adminToken } = createUserAdmin.body;

        const updateUserField = await request(app).patch("/api/users/updateUserField").send({
            gamesPlayed: "some string"

        }).query({
            user_id: user.body.user._id

        }).set({
            authorization: `Bearer ${adminToken}`
        });

        expect(updateUserField.body).toStrictEqual({ message: "The gamesPlayed field must be a number !" });
        expect(updateUserField.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to update a user field, if 'user_id' is wrong", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 17",
            password: "4798"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "4798"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 18",
            password: "9922"

        }).set({
            authorization: `Bearer ${token}`
        });

        const { adminToken } = createUserAdmin.body;

        const fakeId = "6708a78c0893fdb73078d4ea";

        const updateUserField = await request(app).patch("/api/users/updateUserField").send({
            gamesPlayed: 10

        }).query({
            user_id: fakeId

        }).set({
            authorization: `Bearer ${adminToken}`
        });

        expect(updateUserField.body).toStrictEqual({ message: "User not found !" });
        expect(updateUserField.status).toBe(404);

        await mongoose.connection.close();
    });

    it("shouldn't be able to update a user field, if the token isn't a 'adminToken'", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 19",
            password: "4545"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "4545"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 20",
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