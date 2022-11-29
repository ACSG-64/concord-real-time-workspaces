const User = require('./user');
const Message = require('./message');
const Channel = require('./channel');
const Workspace = require('./workspace');
const Membership = require('./membership');


//Set Associations
User.hasMany(Message);
Message.belongsTo(User);

User.belongsToMany(Workspace, {
    through: Membership
});

Workspace.belongsToMany(User, {
    through: Membership
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