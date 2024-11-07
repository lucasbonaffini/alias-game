const mongoose = require("mongoose");
const inmemoryUserController = require("../../../controllers/in-memory/in-memory-userController");
const inmemoryAuthController = require("../../../controllers/in-memory/in-memory-authController");
const userModel = require("../../../models/userModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Get Specific User (Unit Test)", () => {

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

        const getUser = await inmemoryUserController.getSpecificUserController({
            user_id: user.res._id,
            token: adminToken
        });

        expect(getUser.username).toEqual("User 1");
        expect(getUser).toHaveProperty("gamesPlayed");
        expect(getUser).toHaveProperty("gamesWon");

        await mongoose.connection.close();
    });

    it("shouldn't be able to search a User, if 'user_id' is wrong", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 3",
            password: "1199"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "1199"
        });

        const { token } = login;

        const createUserAdmin = await inmemoryAuthController.createAdminController({
            username: "User 4",
            password: "6644",
            token: token
        });

        const { adminToken } = createUserAdmin;

        const fakeId = "6708a78c0893fdb73078d4ea";

        await expect(
            inmemoryUserController.getSpecificUserController({
                user_id: fakeId,
                token: adminToken
            })

        ).rejects.toEqual(Error('User not found !'));

        await mongoose.connection.close();
    });

    it("shouldn't be able to search a User, if the token isn't a 'adminToken'", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 5",
            password: "4545"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "4545"
        });

        const { token } = login;

        await inmemoryAuthController.createAdminController({
            username: "User 6",
            password: "8899",
            token: token
        });

        await expect(
            inmemoryUserController.getSpecificUserController({
                user_id: user.res._id,
                token: token
            })

        ).rejects.toEqual(Error("Access denied, administrator role required"));

        await mongoose.connection.close();
    });

});
