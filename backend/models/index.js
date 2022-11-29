const User = require('./user');
const Message = require('./message');
const Channel = require('./channel');
const Workspace = require('./workspace');
const Membership = require('./membership');


//Set Associations
User.hasMany(Message, {
    onDelete: 'CASCADE',
});
Message.belongsTo(User);

User.belongsToMany(Workspace, {
    through: Membership,
    onDelete: 'CASCADE'
});

User.hasMany(Message);
Message.belongsTo(User);

Workspace.belongsToMany(User, {
    through: Membership,
    onDelete: 'CASCADE'
});

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