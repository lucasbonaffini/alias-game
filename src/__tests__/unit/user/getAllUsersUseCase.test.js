const mongoose = require("mongoose");
const inmemoryUserController = require("../../../controllers/in-memory/in-memory-userController");
const inmemoryAuthController = require("../../../controllers/in-memory/in-memory-authController");
const userModel = require("../../../models/userModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Get All Users (Unit Test)", () => {

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

        const user = await inmemoryUserController.createUserController({
            username: "User 1",
            password: "9988"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "9988"
        });

        const { token } = login;

        const createUserAdmin = await inmemoryAuthController.createAdminController({
            username: "User 2",
            password: "1267",
            token: token
        })

        const { adminToken } = createUserAdmin;

        const getAllUsers = await inmemoryUserController.getAllUsersController({
            token: adminToken
        });

        expect(getAllUsers.length).toBe(2);

        await mongoose.connection.close();
    });

    it("shouldn't be able to get all Users, if the token isn't a 'adminToken'", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 3",
            password: "3344"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "3344"
        });

        const { token } = login;

        await inmemoryAuthController.createAdminController({
            username: "User 4",
            password: "1267",
            token: token
        })

        await expect(
            inmemoryUserController.getAllUsersController({
                token: token
            })

        ).rejects.toEqual(Error("Access denied, administrator role required"));

        await mongoose.connection.close();
    });

});
