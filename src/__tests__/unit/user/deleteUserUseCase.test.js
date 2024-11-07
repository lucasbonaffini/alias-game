const mongoose = require("mongoose");
const inmemoryUserController = require("../../../controllers/in-memory/in-memory-userController");
const inmemoryAuthController = require("../../../controllers/in-memory/in-memory-authController");
const userModel = require("../../../models/userModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Delete a User (Unit Test)", () => {

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

        const user = await inmemoryUserController.createUserController({
            username: "User 2",
            password: "1144"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "1144"
        });

        const { token } = login;

        const createUserAdmin = await inmemoryAuthController.createAdminController({
            username: "User 9",
            password: "1267",
            token: token
        })

        const { adminToken } = createUserAdmin;

        const deleteUser = await inmemoryUserController.deleteUserController({
            user_id: user.res._id,
            token: adminToken
        });

        expect(deleteUser).toStrictEqual({ message: "User deleted with sucess !" });

        await mongoose.connection.close();
    });

    it("shouldn't be able to delete a user, if 'user_id' is wrong", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 22",
            password: "2233"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "2233"
        });

        const { token } = login;

        const createUserAdmin = await inmemoryAuthController.createAdminController({
            username: "User 98",
            password: "5577",
            token: token
        })

        const { adminToken } = createUserAdmin;

        const fakeId = "6708a78c0893fdb73078d4ea";

        await expect(
            inmemoryUserController.deleteUserController({
                user_id: fakeId,
                token: adminToken
            })

        ).rejects.toEqual(Error("User not found !"));

        await mongoose.connection.close();
    });

    it("shouldn't be able to delete a user, if the token isn't a 'adminToken'", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "User 4",
            password: "1166"
        });

        const login = await inmemoryAuthController.loginUserController({
            username: user.res.username,
            password: "1166"
        });

        const { token } = login;

        await inmemoryAuthController.createAdminController({
            username: "User 10",
            password: "6688",
            token: token
        })

        await expect(
            inmemoryUserController.deleteUserController({
                user_id: user.res._id,
                token: token
            })

        ).rejects.toEqual(Error("Access denied, administrator role required"));

        await mongoose.connection.close();
    });

});