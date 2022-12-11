const { expect, assert } = require('chai');
const chai = require('chai');
const server = require('../../app');
const orm = require('../../db/orm');
const { v4: UUIDv4 } = require('uuid');
const { Workspace, Membership, Channel } = require('../../models/index');

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

describe('Workspace deletion', () => {
    let agent;
    let workspaceId;

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

        //Then add the workspace ID as a global variable
        const workspace = await Workspace.findOne();
        workspaceId = workspace.id;
    });

    after(async () => {
        await agent.close(); // shut down the server
    });

    it('Delete a Workspace', async () => {
        // GIVEN set of valid data
        const details = {
            password: userDataForm.password
        };
        // WHEN this data is sent to the server
        const response = await agent
            .delete(`/api/workspace/manage/delete/${workspaceId}`)
            .type('form')
            .send(details);

        // THEN workspace, channel and membership are deleted
        assert.isNull(await Workspace.findByPk(workspaceId)); // workspace
        assert.isNull(await Channel.findOne({ where: { workspaceId } })); // channel
        assert.isNull(await Membership.findOne({ where: { workspaceId } })); // membership

        // THEN an successful status code should be received
        assert.equal(response.status, 200);
    });

    it('Delete a non existent Workspace', async () => {
        // GIVEN set of valid data
        const details = {
            password: userDataForm.password
        };

        // WHEN this data is sent to the server but using a non existent workspace ID
        let fakeWorkspaceId = UUIDv4();
        while (fakeWorkspaceId === workspaceId) fakeWorkspaceId = UUIDv4();
        const response = await agent
            .delete(`/api/workspace/manage/delete/${fakeWorkspaceId}`)
            .type('form')
            .send(details);

        // THEN existing workspaces, channels and memberships are NOT deleted
        assert.isNotNull(await Workspace.findByPk(workspaceId)); // workspace
        assert.isNotNull(await Channel.findOne({ where: { workspaceId } })); // channel
        assert.isNotNull(await Membership.findOne({ where: { workspaceId } })); // membership

        // THEN an error status code should be received
        assert.equal(response.status, 500);
    });

    it('Delete a Workspace as an unauthorized User', async () => {
        // GIVEN set of valid data
        const details = {
            password: userDataForm.password
        };
        // WHEN this data is sent to the server
        const response = await chai.request(server)
            .delete(`/api/workspace/manage/delete/${workspaceId}`)
            .type('form')
            .send(details);
        expect(response).to.not.have.cookie('concord_auth'); // confirm there is no cookie        

        // THEN workspace, channel and membership are not deleted
        assert.isNotNull(await Workspace.findByPk(workspaceId)); // workspace
        assert.isNotNull(await Channel.findOne({ where: { workspaceId } })); // channel
        assert.isNotNull(await Membership.findOne({ where: { workspaceId } })); // membership

        // THEN a HTTP error code should be received (401: Unauthorized)
        assert.equal(response.status, 401);
    });

    it('Delete a Workspace with wrong password', async () => {
        // GIVEN set of invalid data
        const details = {
            password: '2ijf8fhi3'
        };
        // WHEN this data is sent to the server
        const response = await agent
            .delete(`/api/workspace/manage/delete/${workspaceId}`)
            .type('form')
            .send(details);

        // THEN workspace, channel and membership are not deleted     
        assert.isNotNull(await Workspace.findByPk(workspaceId)); // workspace
        assert.isNotNull(await Channel.findOne({ where: { workspaceId } })); // channel
        assert.isNotNull(await Membership.findOne({ where: { workspaceId } })); // membership

        // THEN a HTTP error code should be received (403: Forbidden)
        assert.equal(response.status, 403);
    });

    it('Delete a Workspace with a password that is too long', async () => {
        // GIVEN set of invalid data
        const details = {
            password: '3j8d283j328jd9j83j982j939283jd98j3d928j9829jd8d9j9823j8923j9398dj983d3f239jf39j932823f32f2089uf23'
        };
        // WHEN this data is sent to the server
        const response = await agent
            .delete(`/api/workspace/manage/delete/${workspaceId}`)
            .type('form')
            .send(details);

        // THEN workspace, channel and membership are not deleted     
        assert.isNotNull(await Workspace.findByPk(workspaceId)); // workspace
        assert.isNotNull(await Channel.findOne({ where: { workspaceId } })); // channel
        assert.isNotNull(await Membership.findOne({ where: { workspaceId } })); // membership

        // THEN a HTTP error code should be received (400: Bad Request)
        assert.equal(response.status, 400);
    });
});