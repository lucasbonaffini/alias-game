const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../../app");
const userModel = require("../../../models/userModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Create User Admin Controller", () => {

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

    it("should be able to create a user 'Admin'", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 1",
            password: "8822"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "8822"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 2",
            password: "3322"

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(createUserAdmin.body.message).toStrictEqual("Admin created successfully");
        expect(createUserAdmin.body).toHaveProperty("_id");
        expect(createUserAdmin.body.username).toEqual("User 2");
        expect(createUserAdmin.body).toHaveProperty("gamesPlayed");
        expect(createUserAdmin.body).toHaveProperty("gamesWon");
        expect(createUserAdmin.body).toHaveProperty("role");
        expect(createUserAdmin.body.role).toEqual("admin");
        expect(createUserAdmin.status).toBe(201);

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user 'admin', if the 'username' field dosen't have a value", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 8",
            password: "3366"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "3366"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "",
            password: "4565"

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(createUserAdmin.body).toStrictEqual({ message: "The fields must have a value !" });
        expect(createUserAdmin.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user 'admin', if the 'password' field dosen't have a value", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 4",
            password: "9999"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "9999"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 2",
            password: ""

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(createUserAdmin.body).toStrictEqual({ message: "The fields must have a value !" });
        expect(createUserAdmin.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user 'admin', if the 'username' field isn't a string", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 42",
            password: "1111"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "1111"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: 66,
            password: "1232"

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(createUserAdmin.body).toStrictEqual({ message: "The fileds must be a string !" });
        expect(createUserAdmin.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user 'admin', if the 'password' field isn't a string", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 22",
            password: "8888"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "8888"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 12",
            password: 1232

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(createUserAdmin.body).toStrictEqual({ message: "The fileds must be a string !" });
        expect(createUserAdmin.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user 'admin', if already have a user with the same 'username'", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 3",
            password: "4798"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "4798"
        });

        const { token } = login.body;

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 3",
            password: "9922"

        }).set({
            authorization: `Bearer ${token}`
        });

        expect(createUserAdmin.body).toStrictEqual({ message: "User already exists" });
        expect(createUserAdmin.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user 'Admin', if the 'token' isn't valid", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 41",
            password: "4545"
        });

        await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "4545"
        });

        const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDhhNzhjMDg5M2ZkYjczMDc4ZD";

        const createUserAdmin = await request(app).post("/api/auth/createAdmin").send({
            username: "User 99",
            password: "8899"

        }).set({
            authorization: `Bearer ${fakeToken}`
        });

        expect(createUserAdmin.body).toStrictEqual({ message: "Invalid token", error: {} });
        expect(createUserAdmin.status).toBe(403);

        await mongoose.connection.close();
    });

});