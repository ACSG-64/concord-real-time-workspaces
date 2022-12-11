/* General controllers */
const joinWorkspace = require('./general/join-workspace');

/* Management controllers */
const createWorkspace = require('./management/create-workspace');
const removeWorkspace = require('./management/delete-workspace');
const generateInvitation = require('./management/generate-invitation');
const toggleInvitation = require('./management/toggle-invitation');

module.exports = {
    general: { joinWorkspace },
    management: {
        createWorkspace, removeWorkspace,
        generateInvitation, toggleInvitation,
    },
};