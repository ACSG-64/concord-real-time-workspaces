const { DataTypes } = require('sequelize');
const orm = require('../db/orm');

const Membership = orm.define('memberships', {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

module.exports = Membership;