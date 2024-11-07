
const mongoose = require("mongoose");
const userModel = require("../../../models/userModel");
const inmemoryUserController = require("../../../controllers/in-memory/in-memory-userController");
const inmemoryAuthController = require("../../../controllers/in-memory/in-memory-authController");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Create User Admin (Unit Test)", () => {

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

        const user = await inmemoryUserController.createUserController({
            username: "User 1",
            password: "8822"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "8822"
        });

        const { token } = login;

        const createUserAdmin = await inmemoryAuthController.createAdminController({
            username: "User 2",
            password: "3322",
            token: token
        });

        expect(createUserAdmin.message).toStrictEqual("Admin created successfully");
        expect(createUserAdmin).toHaveProperty("_id");
        expect(createUserAdmin.username).toEqual("User 2");
        expect(createUserAdmin).toHaveProperty("gamesPlayed");
        expect(createUserAdmin).toHaveProperty("gamesWon");
        expect(createUserAdmin).toHaveProperty("role");
        expect(createUserAdmin.role).toEqual("admin");

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user 'admin', if the 'username' field dosen't have a value", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 8",
            password: "3366"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "3366"
        });

        const { token } = login;

        await expect(
            inmemoryAuthController.createAdminController({
                username: "",
                password: "4565",
                token: token
            })

        ).rejects.toEqual(Error('The fields must have a value !'));

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user 'admin', if the 'password' field dosen't have a value", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 4",
            password: "9999"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "9999"
        });

        const { token } = login;

        await expect(
            inmemoryAuthController.createAdminController({
                username: "User 2",
                password: "",
                token: token
            })

        ).rejects.toEqual(Error('The fields must have a value !'));

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user 'admin', if the 'username' field isn't a string", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "Shawn Jenkins",
            password: "secret"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "secret"
        });

        const { token } = login;

        await expect(
            inmemoryAuthController.createAdminController({
                username: 66,
                password: "8843",
                token: token
            })

        ).rejects.toEqual(Error('The fileds must be a string !'));

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user 'admin', if the 'password' field isn't a string", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 22",
            password: "8888"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "8888"
        });

        const { token } = login;

        await expect(
            inmemoryAuthController.createAdminController({
                username: "User 12",
                password: 1232,
                token: token
            })
            
        ).rejects.toEqual(Error('The fileds must be a string !'));

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user 'admin', if already have a user with the same 'username'", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 3",
            password: "4798"
        });

        const login = inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "4798"
        });

        const { token } = login;

        const createUserAdmin = await inmemoryAuthController.createAdminController({
            username: "User 3",
            password: "9922",
            token: token
        });

        expect(createUserAdmin).toStrictEqual({ message: "User already exists" });

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a user 'Admin', if the token isn't valid", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 44",
            password: "4545"
        });

        await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "4545"
        });

        const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDhhNzhjMDg5M2ZkYjczMDc4ZD";

        await expect(
            inmemoryAuthController.createAdminController({
                username: "User 5",
                password: "8899",
                token: fakeToken
            })
            
        ).rejects.toEqual(Error('Invalid Token !'));

        await mongoose.connection.close();
    });

});