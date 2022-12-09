const auth = require('./auth');
const account = require('./account');
const workspace = require('./workspace');

module.exports = {
    authEndpoint: auth,
    accountEndpoint: account,
    workspaceEndpoint: workspace,
};