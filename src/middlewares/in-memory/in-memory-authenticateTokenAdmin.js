const authController = require("../../controllers/authController");
const { verifyToken } = require("../../utils/jwt");

const inMemoryAuthenticateTokenAdmin = async (token) => {

    const user = verifyToken(token);

    const validUser = await authController.findUserById(user.id);

    const checkAdmin = validUser.role === 'admin' ? true : false;

    if(checkAdmin === false) {
        throw new Error("Access denied, administrator role required");
    }

    return checkAdmin;
}

module.exports = inMemoryAuthenticateTokenAdmin;