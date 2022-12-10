const User = require('./user');
const Message = require('./message');
const Channel = require('./channel');
const Workspace = require('./workspace');
const Membership = require('./membership');

/* Relationships */

//User-Message
User.hasMany(Message);
Message.belongsTo(User);

// User-Workspace
User.belongsToMany(Workspace, {
    through: Membership
});

// Workspace-User
Workspace.belongsToMany(User, {
    through: Membership
});

// Workspace-Channel
Workspace.hasMany(Channel, {
    onDelete: 'CASCADE'
});
Channel.belongsTo(Workspace);

// Channel-Message
Channel.hasMany(Message, {
    onDelete: 'CASCADE'
});
Message.belongsTo(Channel);

// Message-Message (reply)
Message.hasMany(Message, {
    onDelete: 'CASCADE',
    foreignKey: 'replyToMsgId'
});

module.exports = {
    User,
    Message,
    Channel,
    Workspace,
    Membership,
};