const mongoose = require("mongoose");
const inmemoryUserController = require("../../../controllers/in-memory/in-memory-userController");
const inmemoryAuthController = require("../../../controllers/in-memory/in-memory-authController");
const userModel = require("../../../models/userModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Update Specific User Field (Unit Test)", () => {

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

        const user = await inmemoryUserController.createUserController({
            username: "User 6",
            password: "9988"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "9988"
        });

        const { token } = login;

        const createUserAdmin = await inmemoryAuthController.createAdminController({
            username: "User 7",
            password: "1267",
            token: token
        })

        const { adminToken } = createUserAdmin;

        const updateUserField = await inmemoryUserController.updateSpecificUserFieldController({
            user_id: user.res._id,
            gamesPlayed: 8,
            token: adminToken
        });

        expect(updateUserField.username).toEqual("User 6");
        expect(updateUserField.gamesPlayed).toEqual(8);
        expect(updateUserField).toHaveProperty("_id");
        expect(updateUserField).toHaveProperty("gamesWon");

        await mongoose.connection.close();
    });

    it("shouldn't be able to update a user field, if the 'gamesPlayed' doesn't have a value", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 10",
            password: "4466"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "4466"
        });

        const { token } = login;

        const createUserAdmin = await inmemoryAuthController.createAdminController({
            username: "User 1",
            password: "4499",
            token: token
        })

        const { adminToken } = createUserAdmin;

        await expect(
            inmemoryUserController.updateSpecificUserFieldController({
                user_id: user.res._id,
                gamesPlayed: "",
                token: adminToken
            })

        ).rejects.toEqual(Error("The gamesPlayed field must have a value !"));

        await mongoose.connection.close();
    });

    it("shouldn't be able to update a user field, if the 'gamesPlayed' isn't a number", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 4",
            password: "8899"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "8899"
        });

        const { token } = login;

        const createUserAdmin = await inmemoryAuthController.createAdminController({
            username: "User 12",
            password: "3333",
            token: token
        })

        const { adminToken } = createUserAdmin;

        await expect(
            inmemoryUserController.updateSpecificUserFieldController({
                user_id: user.res._id,
                gamesPlayed: "some string",
                token: adminToken
            })

        ).rejects.toEqual(Error("The gamesPlayed field must be a number !"));

        await mongoose.connection.close();
    });

    it("shouldn't be able to update a user field, if 'user_id' is wrong", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 2",
            password: "1122"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "1122"
        });

        const { token } = login;

        const createUserAdmin = await inmemoryAuthController.createAdminController({
            username: "User 4",
            password: "6688",
            token: token
        })

        const { adminToken } = createUserAdmin;

        const fakeId = "6708a78c0893fdb73078d4ea";

        await expect(
            inmemoryUserController.updateSpecificUserFieldController({
                user_id: fakeId,
                gamesPlayed: 9,
                token: adminToken
            })

        ).rejects.toEqual(Error("User not found !"));

        await mongoose.connection.close();
    });

    it("shouldn't be able to update a user field, if the token isn't a 'adminToken'", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 22",
            password: "7799"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "7799"
        });

        const { token } = login;

        await inmemoryAuthController.createAdminController({
            username: "User 7",
            password: "9911",
            token: token
        })

        await expect(
            inmemoryUserController.updateSpecificUserFieldController({
                user_id: user.res._id,
                gamesPlayed: 9,
                token: token
            })

        ).rejects.toEqual(Error("Access denied, administrator role required"));

        await mongoose.connection.close();
    });

});
