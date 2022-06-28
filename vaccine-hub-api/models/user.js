const db = require("../db")
const { UnauthorizedError } = require("../utils/errors")

class User {
    static async login(credentials) {
    // add code here

    throw new UnauthorizedError("Invalid email/password combo")
    }

    static async register(credentials){
    // add code here
    }
}

module.exports = User