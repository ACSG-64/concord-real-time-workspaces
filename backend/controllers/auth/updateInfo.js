const args = require('../../utils/args');
const { body } = require('express-validator');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { User } = require('../../models/index');
const toMilliseconds = require('../../utils/toMilliseconds');
const login = require('./login');



async function controller(req, res) {
    // Get the needed fields from the body of the request
    const { user_id } = req.body;
    const _id = req.params.userId;
    // try {
    //     // Securely hash the password using the Argon2id algorithm
    //     const password = await argon2.hash(raw_pswd);
    //     // Store the new user into the DB
    //     const users = await User.findAll({
    //         where: {
    //             id: userId
    //         }
    //     });

    //     // Respond to the client on success
    //     res.status(200).send('User registered successfully');
    // } catch (e) {
    //     if (e?.name === 'SequelizeUniqueConstraintError') {
    //         res.status(409).send('An account with that user name or email already exists');
    //     } else {
    //         res.status(500).send('Unexpected error, please try again');
    //     }
    // }
    //Find User by ID
    try {
        const user = await User.findOne({
            where: {
                id: _id
            }
        });
        res.status(200).json({ "user": user });
    } catch (error) {
        res.status(404).send("User not found")
    }
}


const validators = [

];

module.exports = {
    validators,
    controller
};