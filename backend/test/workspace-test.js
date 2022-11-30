const { expect, assert } = require('chai');
const chai = require('chai');
const server = require('../app');
const orm = require('../db/orm');
const { Workspace, Membership, Channel } = require('../models/index');

chai.use(require('chai-http'));

const userDataForm = {
    first_name: 'John',
    last_name: 'Doe',
    user_name: 'jdoe64',
    password: 'LongPa$$word28',
    email: 'jdoe@test.com'
};

// const workspaceDataForm = {
//     id: '38fj3f3-f3f3f-fnovin',
//     name: 'Test Workspace'
// };


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
    });

    after(async () => {
        await agent.close(); // shut down the server
    });

    it('Create a Workspace', async () => {
        //GIVEN set of valid data
        const details = {
            name: 'New Workspace'
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

        // WILL ALSO CHECK IF THE WORKSPACE AND MEMBERSHIP USERID IS THE SAME AS THE CREATED 
        // USER

        assert.equal(workspace.id, channel.workspaceId);
        assert.equal(workspace.id, membership.workspaceId);
        // THEN an successful status code should be received
        assert.equal(response.status, 200);

        //Set workspace ID for delete workspace.
        workspaceId = workspace.id;
    });

    it('Create a Workspace as an Unauthorized User', async () => {
        //GIVEN set of valid data
        const details = {
            name: 'New Workspace'
        };

        //WHEN this data is sent to the server
        const response = await chai.request(server)
            .post('/api/workspace/create')
            .type('form')
            .send(details);
        expect(response).to.not.have.cookie('concord_auth'); // confirm there is no cookie

        //THEN workspace is not created
        const workspace = await Workspace.findOne();
        let workspaceName;
        //If there is no workspace in the DB
        if(workspace === null){
            workspaceName = 'null';
            assert.notEqual(details.name, workspaceName);
        }else{
            //If there is one in the DB
            assert.notEqual(details.name, workspace.name);
        }
        
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
        
        // const membership = await Membership.findOne();
        // console.log(membership)
        //THEN workspace is deleted
        const workspace = await Workspace.findOne();

        assert.equal(null, workspace);

        // THEN an successful status code should be received
        assert.equal(response.status, 200);

    });
});