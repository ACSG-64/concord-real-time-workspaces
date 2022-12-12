const { expect, assert } = require('chai');
const chai = require('chai');
const server = require('../../app');
const orm = require('../../db/orm');
const { User, Workspace, Membership, Channel } = require('../../models/index');

chai.use(require('chai-http'));

const userDataForm = {
    first_name: 'John',
    last_name: 'Doe',
    user_name: 'jdoe64',
    password: 'LongPa$$word28',
    email: 'jdoe@test.com'
};

const workspaceDataForm = {
    name: 'New Workspace',
    password: userDataForm.password
};

describe('Workspace creation', () => {
    let agent;

    beforeEach(async () => {
        /* Start the server */
        await orm.sync({ force: true }); // reset the DB
        agent = chai.request.agent(server);
        // Register a user
        await agent
            .post('/api/auth/register')
            .type('form')
            .send(userDataForm);

        // Login into the account
        await agent
            .post('/api/auth/login')
            .type('form')
            .send({
                user_id: userDataForm.email,
                password: userDataForm.password
            });

        //Create a Workspace
        await agent
            .post('/api/workspace/manage/create')
            .type('form')
            .send({
                name: workspaceDataForm.name
            });
    });

    after(async () => {
        await agent.close(); // shut down the server
    });

    it('Create a Workspace', async () => {
        //GIVEN set of valid data
        const details = {
            name: 'Test Workspace'
        };

        //WHEN this data is sent to the server
        const response = await agent
            .post('/api/workspace/manage/create')
            .type('form')
            .send(details);

        /* THEN check if the workspace ID is the same as the channel
           and Membership workspace ID */
        const workspace = await Workspace.findOne();
        const channel = await Channel.findOne();
        const membership = await Membership.findOne();

        assert.equal(workspace.id, channel.workspaceId);
        assert.equal(workspace.id, membership.workspaceId);

        // THEN check if membership has the same ID as the owner of the workspace
        const user = await User.findOne();
        assert.equal(membership.userId, user.id);

        // THEN an successful status code should be received
        assert.equal(response.status, 200);
    });

    it('Create a Workspace as an Unauthorized User', async () => {
        //GIVEN set of valid data
        const details = {
            name: 'Test Workspace'
        };

        //WHEN this data is sent to the server
        const response = await chai.request(server)
            .post('/api/workspace/manage/create')
            .type('form')
            .send(details);
        expect(response).to.not.have.cookie('concord_auth'); // confirm there is no cookie

        //THEN workspace is not created
        const workspace = await Workspace.findOne({ where: { name: details.name } });
        assert.isNull(workspace);

        // and a HTTP error code should be received (401: Unauthorized)
        assert.equal(response.status, 401);
    });
});