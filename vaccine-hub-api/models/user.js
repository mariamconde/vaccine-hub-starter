const bcrypt = require('bcrypt');
const db = require('../db');
const {BCRYPT_WORK_FACTOR} = require('../config');
const { UnauthorizedError, BadRequestError } = require('../utils/errors');

class User {
    static async makePublicUser(user) {
        return{
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            location: user.location
        }
    }

    static async login(credentials) {
 
        const requiredFields = ['email', 'password'];
        requiredFields.forEach(field => {
            if (!credentials.hasOwnProperty(field)) {
                throw new BadRequestError(`Missing ${field} in request body.`)
            }
        })

        const user = await User.fetchUserByEmail(credentials.email);

        if (user) {
            const isValid = await bcrypt.compare(credentials.password, user.password);
            if (isValid) {
                return User.makePublicUser(user);
            }

        }
  
        throw new UnauthorizedError("Invalud email/password combo")
    }

    static async register(credentials) {

        const requiredFields = ['email', 'password', 'first_name', 'last_name', 'location'];
        requiredFields.forEach(field => {
            if (!credentials.hasOwnProperty(field)) {
                throw new BadRequestError(`Missing ${field} in request body.`)
            }
        })
        if (credentials.email.indexOf('@') <= 0) {
            throw new BadRequestError("Invalid Email")
        }

        const existingUser = await User.fetchUserByEmail(credentials.email);
        if (existingUser) {
            throw new BadRequestError(`Duplicate email: ${credentials.email}`)
        }


        const hashedPass = await bcrypt.hash(credentials.password, BCRYPT_WORK_FACTOR);

        const lowercasedEmail = credentials.email.toLowerCase();


        const result = await db.query(`
            INSERT INTO users (
                email,
                password,
                first_name,
                last_name,
                location
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, first_name, last_name, location, date;
        `, [lowercasedEmail, hashedPass, credentials.first_name, credentials.last_name, credentials.location])

        //returns user
        const user = result.rows[0];

        return User.makePublicUser(user);
    }

    static async fetchUserByEmail(email) {
        if(!email) {
            throw new BadRequestError("no email provided");
        }

        const query = `SELECT * FROM users WHERE email = $1`;

        const result = await db.query(query, [email.toLowerCase()]);

        const user = result.rows[0];

        return user;
    }
}

module.exports = User