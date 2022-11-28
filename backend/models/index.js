const User = require('./user');
const Message = require('./message');
const Channel = require('./channel');
const Workspace = require('./workspace');
const Membership = require('./membership');
const { DataTypes } = require('sequelize');


User.hasMany(Message, {
    foreignKey: {
        allowNull: true,
        type: DataTypes.UUID,
    },
    onDelete: 'CASCADE',
});
Message.belongsTo(User);

User.hasMany(Membership, {
    onDelete: 'CASCADE'
});
Membership.belongsTo(User);

Workspace.hasMany(Membership, {
    onDelete: 'CASCADE'
});
Membership.belongsTo(Workspace);

Workspace.hasMany(Channel, {
    onDelete: 'CASCADE'
});
Channel.belongsTo(Workspace);

Channel.hasMany(Message, {
    onDelete: 'CASCADE'
});
Message.belongsTo(Channel);

Message.hasMany(Message, {
    onDelete: 'CASCADE'
});
Message.belongsTo(Message);

module.exports = {
    User,
    Message,
    Channel,
    Workspace,
    Membership,
};