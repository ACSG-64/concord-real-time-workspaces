const { DataTypes } = require('sequelize');
const orm = require('../db/orm');

const Workspace = orm.define('workspace', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    name: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    icon: {
        type: DataTypes.STRING,
        isUrl: true,
    },
    invitationId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
    },
    acceptingNewcomers: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
}, {
    updatedAt: false,
});

module.exports = Workspace;