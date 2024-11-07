const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../../app");
const userModel = require("../../../models/userModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Create User Controller", () => {

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

    it("should be able to create a User", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "Some User",
            password: "1234"
        });

        expect(user.body.message).toStrictEqual("User registered");
        expect(user.body.user.username).toEqual("Some User");
        expect(user.body.user).toHaveProperty("gamesPlayed");
        expect(user.status).toBe(201);

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user if the 'username' field dosen't have a value", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "",
            password: "3366"
        });

        expect(user.body).toStrictEqual({ message: "The fields must have a value !" });
        expect(user.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user, if the 'password' field dosen't have a value", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 4",
            password: ""
        });

        expect(user.body).toStrictEqual({ message: "The fields must have a value !" });
        expect(user.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user, if the 'username' field isn't a string", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: 88,
            password: "1111"
        });

        expect(user.body).toStrictEqual({ message: "The fileds must be a string !" });
        expect(user.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user 'admin', if the 'password' field isn't a string", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "User 22",
            password: 8888
        });

        expect(user.body).toStrictEqual({ message: "The fileds must be a string !" });
        expect(user.status).toBe(401);

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a User, if user already exists", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await request(app).post("/api/users/createUser").send({
            username: "Some User",
            password: "5678"
        });

        expect(user.body).toStrictEqual({ message: "User already exists" });
        expect(user.status).toBe(401);

        await mongoose.connection.close();
    });

});