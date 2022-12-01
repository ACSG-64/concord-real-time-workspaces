const { expect, assert } = require('chai');
const chai = require('chai');
const server = require('../app');
const orm = require('../db/orm');
const { User, Workspace, Membership, Channel } = require('../models/index');

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


describe('Create and delete a workspace', () => {
    let agent;
    let workspaceId;
    beforeEach(async () => {
        /* Start the server */
        await orm.sync({ force: true }); // reset the DB
        agent = await chai.request.agent(server);

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
            .post('/api/workspace/create')
            .type('form')
            .send({
                name: workspaceDataForm.name
            });
        //Then add the workspace ID as a global variable
        const workspace = await Workspace.findOne();
        workspaceId = workspace.id;
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
            .post('/api/workspace/create')
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
            .post('/api/workspace/create')
            .type('form')
            .send(details);
        expect(response).to.not.have.cookie('concord_auth'); // confirm there is no cookie

        //THEN workspace is not created
        const workspace = await Workspace.findOne();
        assert.notEqual(details.name, workspace.name);
        // and a HTTP error code should be received (401: Unauthorized)
        assert.equal(response.status, 401);
    });

    it('Delete a Workspace', async () => {
        //GIVEN set of valid data
        const details = {
            password: userDataForm.password
        };
        //WHEN this data is sent to the server
        const response = await agent
            .delete(`/api/workspace/delete/${workspaceId}`)
            .type('form')
            .send(details);
        
        //THEN workspace, channel and membership are deleted
        const workspace = await Workspace.findOne();
        const channel = await Channel.findOne();
        const membership = await Membership.findOne();

        assert.equal(null, workspace);
        assert.equal(null, channel);
        assert.equal(null, membership);

        // THEN an successful status code should be received
        assert.equal(response.status, 200);
    });

    it('Delete a Workspace as an unauthorized User', async () => {
        //GIVEN set of valid data
        const details = {
            password: userDataForm.password
        };
        //WHEN this data is sent to the server
        const response = await chai.request(server)
            .delete(`/api/workspace/delete/${workspaceId}`)
            .type('form')
            .send(details);
        expect(response).to.not.have.cookie('concord_auth'); // confirm there is no cookie

        // THEN a HTTP error code should be received (401: Unauthorized)
        assert.equal(response.status, 401);
    });

    it('Delete a Workspace with wrong password', async () => {
        //GIVEN set of invalid data
        const details = {
            password: '2ijf8fhi3'
        };
        //WHEN this data is sent to the server
        const response = await agent
            .delete(`/api/workspace/delete/${workspaceId}`)
            .type('form')
            .send(details);

        // THEN a HTTP error code should be received (403: Forbidden)
        assert.equal(response.status, 403);
    });

});