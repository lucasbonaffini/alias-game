const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../../app");
const userModel = require("../../../models/userModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Login User Controller", () => {

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

    it("should be able to login a valid 'User'", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 1",
            password: "8822"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "8822"
        });

        expect(login.body.message).toStrictEqual("Logged in");
        expect(login.body).toHaveProperty("token");
        expect(login.body).toHaveProperty("id");
        expect(login.status).toBe(200);

        await mongoose.connection.close();
    });

    it("shouldn't be able to to login a user, if the 'username' field dosen't have a value", async () => {

        await mongoose.connect(MONGO_URl);

        await request(app).post("/api/users/createUser").send({
            username: "User 8",
            password: "3366"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: "",
            password: "3366"
        });

        expect(login.body).toStrictEqual({ message: "The fields must have a value !" });
        expect(login.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to login a user, if the 'password' field dosen't have a value", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 4",
            password: "9999"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: ""
        });

        expect(login.body).toStrictEqual({ message: "The fields must have a value !" });
        expect(login.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to login a user, if the 'username' field isn't a string", async () => {

        await mongoose.connect(MONGO_URl);

        await request(app).post("/api/users/createUser").send({
            username: "User 42",
            password: "1111"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: 7788,
            password: "1111"
        });

        expect(login.body).toStrictEqual({ message: "The fileds must be a string !" });
        expect(login.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to to login a user, if the 'password' field isn't a string", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 22",
            password: "8888"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: 8888
        });

        expect(login.body).toStrictEqual({ message: "The fileds must be a string !" });
        expect(login.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to login a user, if the 'username' field is wrong", async () => {

        await mongoose.connect(MONGO_URl);

        await request(app).post("/api/users/createUser").send({
            username: "User 2",
            password: "9999"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: "Fake username",
            password: "9999"
        });

        expect(login.body).toStrictEqual({ message: "Invalid credentials" });
        expect(login.status).toBe(400);

        await mongoose.connection.close();
    });

    it("shouldn't be able to login a user, if the 'password' field is wrong", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 3",
            password: "9999"
        });

        const login = await request(app).post("/api/auth/login").send({
            username: user.body.user.username,
            password: "Fake password"
        });

        expect(login.body).toStrictEqual({ message: "Invalid credentials" });
        expect(login.status).toBe(400);

        await mongoose.connection.close();
    });

});