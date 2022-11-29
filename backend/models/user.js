const { DataTypes } = require('sequelize');
const orm = require('../db/orm');

const User = orm.define('user', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    user_name: {
        type: DataTypes.STRING(10),
        unique: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    picture: DataTypes.STRING,
}, {
    updatedAt: false,
});

module.exports = User;
