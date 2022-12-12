const { DataTypes } = require('sequelize');
const orm = require('../db/orm');

const Membership = orm.define('membership', {
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