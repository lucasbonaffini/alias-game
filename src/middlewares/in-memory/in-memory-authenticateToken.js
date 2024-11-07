const { createHmacSHA256Signature } = require("../../utils/jwt");

const inMemoryAuthenticateToken = async (token) => {
    
    const [headerBase64, payloadBase64, providedSignature] = token.split('.');

    const expectedSignature = createHmacSHA256Signature(headerBase64, payloadBase64);

    const checkIsValidUser = providedSignature === expectedSignature ? true : false;

    if(checkIsValidUser === false) {
        throw new Error("Invalid Token !");
    }

    return checkIsValidUser;
};

module.exports = inMemoryAuthenticateToken;