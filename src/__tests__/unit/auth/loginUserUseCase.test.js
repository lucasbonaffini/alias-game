const mongoose = require("mongoose");
const userModel = require("../../../models/userModel");
const inmemoryUserController = require("../../../controllers/in-memory/in-memory-userController");
const inmemoryAuthController = require("../../../controllers/in-memory/in-memory-authController");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Login User (Unit Test)", () => {

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

        const user = await inmemoryUserController.createUserController({
            username: "User 1",
            password: "8822"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "8822"
        });

        expect(login.message).toStrictEqual("Logged in");
        expect(login).toHaveProperty("token");
        expect(login).toHaveProperty("id");

        await mongoose.connection.close();
    });

    it("shouldn't be able to to login a user, if the 'username' field dosen't have a value", async () => {

        await mongoose.connect(MONGO_URl);

        await inmemoryUserController.createUserController({
            username: "User 8",
            password: "3366"
        });

        await expect(
            inmemoryAuthController.loginUserController({
                username: "",
                password: "3366"
         })

        ).rejects.toEqual(Error("The fields must have a value !"));

        await mongoose.connection.close();
    });

    it("shouldn't be able to login a user, if the 'password' field dosen't have a value", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 4",
            password: "9999"
        });

        await expect(
            inmemoryAuthController.loginUserController({
                username: user.res.username,
                password: ""
            })

        ).rejects.toEqual(Error("The fields must have a value !"));

        await mongoose.connection.close();
    });

    it("shouldn't be able to login a user, if the 'username' field isn't a string", async () => {

        await mongoose.connect(MONGO_URl);

        await inmemoryUserController.createUserController({
            username: "User 42",
            password: "1111"
        });

        await expect(
            inmemoryAuthController.loginUserController({
                username: 8888,
                password: "1111"
            })

        ).rejects.toEqual(Error("The fileds must be a string !"));

        await mongoose.connection.close();
    });

    it("shouldn't be able to login a user, if the 'password' field isn't a string", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 22",
            password: "8888"
        });

        await expect(
            inmemoryAuthController.loginUserController({
                username: user.res.username,
                password: 8888
            })

        ).rejects.toEqual(Error("The fileds must be a string !"));

        await mongoose.connection.close();
    });

    it("shouldn't be able to login a user, if the 'username' field is wrong", async () => {

        await mongoose.connect(MONGO_URl);

        await inmemoryUserController.createUserController({
            username: "User 2",
            password: "9999"
        });

        await expect(
            inmemoryAuthController.loginUserController({
                username: "Fake username",
                password: "9999"
            })

        ).rejects.toEqual(Error('Invalid credentials'));

        await mongoose.connection.close();
    });

    it("shouldn't be able to login a user, if the 'password' field is wrong", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 3",
            password: "9999"
        });

        await expect(
            inmemoryAuthController.loginUserController({
                username: user.res.username,
                password: "Fake password"
            })

        ).rejects.toEqual(Error('Invalid credentials'));


        await mongoose.connection.close();
    });

});
