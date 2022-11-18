const { DataTypes } = require('sequelize');
const orm = require('../db/orm');

const Workspace = orm.define('workspaces', {
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
})

module.exports = Workspace;