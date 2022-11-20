const { DataTypes } = require('sequelize');
const orm = require('../db/orm');

const Message = orm.define('message', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    timestamps: true,
});

module.exports = Message;