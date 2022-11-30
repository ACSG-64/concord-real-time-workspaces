const { DataTypes } = require('sequelize');
const orm = require('../db/orm');

const Membership = orm.define('membership', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    role: {
        type: DataTypes.ENUM,
        values: ['owner', 'member'],
        defaultValue: 'member',
        allowNull: false,
    },
}, {
    updatedAt: false,
});

module.exports = Membership;