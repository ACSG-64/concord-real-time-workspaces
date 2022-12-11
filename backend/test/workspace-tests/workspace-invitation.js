const { assert } = require('chai');
const chai = require('chai');
const server = require('../../app');
const orm = require('../../db/orm');
const { User, Workspace, Membership } = require('../../models/index');

chai.use(require('chai-http'));

const workspaceOwnerData = {
    first_name: 'John',
    last_name: 'Doe',
    user_name: 'jdoe64',
    password: 'LongPa$$word28',
    email: 'jdoe@test.com'
};

const guestUserData = {
    first_name: 'Jane',
    last_name: 'Roe',
    user_name: 'jroe23',
    password: 'LongPa$$word28',
    email: 'jroe@tester.com'
};

const workspaceDataForm = {
    name: 'New Workspace',
    password: workspaceOwnerData.password
};

describe('Managing invitations', () => {
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
            .send(workspaceOwnerData);

        // Login into the account
        await agent
            .post('/api/auth/login')
            .type('form')
            .send({
                user_id: workspaceOwnerData.email,
                password: workspaceOwnerData.password
            });

        //Create a Workspace
        await agent
            .post('/api/workspace/manage/create')
            .type('form')
            .send({
                name: workspaceDataForm.name
            });

        //Then add the workspace ID as a global variable
        ({ id: workspaceId } = await Workspace.findOne());
    });

    after(async () => {
        await agent.close(); // shut down the server
    });

    it('Toggle invitation (enable/disable invitation)', async () => {
        // GIVEN a workspace

        /* ENABLE INVITATION */
        // WHEN the owner enables the invitation code
        let response = await agent
            .patch(`/api/workspace/manage/${workspaceId}/invitation/enable`);

        // THEN the 'acceptingNewcomers' field is TRUE
        let { acceptingNewcomers } = await Workspace.findByPk(workspaceId);
        assert.isTrue(acceptingNewcomers);
        assert.equal(response.status, 200);

        /* DISABLE INVITATION */
        // WHEN the owner disables the invitation code
        response = await agent
            .patch(`/api/workspace/manage/${workspaceId}/invitation/disable`);

        // THEN the 'acceptingNewcomers' field is FALSE
        ({ acceptingNewcomers } = await Workspace.findByPk(workspaceId));
        assert.isFalse(acceptingNewcomers);
        assert.equal(response.status, 200);
    });

    it('Generate a new invitation code', async () => {
        // GIVEN a workspace with a default invitation ID
        const { invitationId: oldInvitationId } = await Workspace.findByPk(workspaceId);

        // WHEN the owner requests to generate a new invitation ID
        const response = await agent
            .get(`/api/workspace/manage/${workspaceId}/invitation/generate`);
        const { invitationId: newInvitationId } = await Workspace.findByPk(workspaceId);

        // THEN the response of the request is the new invitation ID
        assert.equal(response.body.invitationId, newInvitationId);
        // THEN the old invitation ID and the new one don't match
        assert.notEqual(oldInvitationId, newInvitationId);
    });
});

describe('Accepting invitations', () => {
    let ownerAgent;
    let guestAgent;
    let workspace;

    beforeEach(async () => {
        /* Start the server */
        await orm.sync({ force: true }); // reset the DB

        ownerAgent = chai.request.agent(server);
        guestAgent = chai.request.agent(server);

        // Register both users
        await ownerAgent
            .post('/api/auth/register')
            .type('form')
            .send(workspaceOwnerData);

        await guestAgent
            .post('/api/auth/register')
            .type('form')
            .send(guestUserData);

        // Login both users into their respective accounts
        await ownerAgent
            .post('/api/auth/login')
            .type('form')
            .send({
                user_id: workspaceOwnerData.email,
                password: workspaceOwnerData.password
            });

        await guestAgent
            .post('/api/auth/login')
            .type('form')
            .send({
                user_id: guestUserData.email,
                password: guestUserData.password
            });

        //Create a Workspace
        await ownerAgent
            .post('/api/workspace/manage/create')
            .type('form')
            .send({ name: workspaceDataForm.name });

        //Then add the workspace as a global variable
        workspace = await Workspace.findOne();
    });

    after(async () => {
        await ownerAgent.close(); // shut down the server
        await guestAgent.close(); // shut down the server
    });

    it('Try to join a workspace when it is NOT accepting newcomers', async () => {
        // GIVEN an existent workspace which is not accepting newcomers
        assert.isFalse(workspace.acceptingNewcomers);

        // WHEN a user tries to join to that workspace using a valid invitation ID
        const response = await guestAgent
            .get(`/api/workspace/invitation/${workspace.invitationId}`);

        // THEN no new memberships are created
        const memberships = await Membership.count({ where: { workspaceId: workspace.id } });
        assert.equal(memberships, 1); // the existent membership belongs to the owner

        // THEN an error status code is received as response (403: Forbidden)
        assert.equal(response.status, 403);
    });

    it('Join a workspace when it IS accepting newcomers', async () => {
        // GIVEN an existent workspace which is accepting newcomers
        await ownerAgent
            .patch(`/api/workspace/manage/${workspace.id}/invitation/enable`);

        // WHEN a new user tries to join to that workspace using a valid invitation ID
        const response = await guestAgent
            .get(`/api/workspace/invitation/${workspace.invitationId}`);

        // THEN a new membership is created with the role 'member'
        const { id: userId } = await User.findOne({ where: { email: guestUserData.email } });
        const { role } = await Membership.findOne({ where: { workspaceId: workspace.id, userId } });
        assert.equal(role, 'member');

        // THEN a success status code is received as response (200: OK)
        assert.equal(response.status, 200);
    });

    it('Join a workspace when the user is already a member', async () => {
        // GIVEN an existent workspace which is accepting newcomers
        await ownerAgent
            .patch(`/api/workspace/manage/${workspace.id}/invitation/enable`);

        // WHEN a user who has already access to that workspace 
        // tries to join that workspace again
        const response = await ownerAgent
            .get(`/api/workspace/invitation/${workspace.invitationId}`);

        // THEN no new memberships are created
        const { id: userId } = await User.findOne({ where: { email: workspaceOwnerData.email } });
        const memberships = await Membership.findAll({ where: { workspaceId: workspace.id, userId } });
        assert.equal(memberships.length, 1);

        // THEN the role of the user is not overwritten
        assert.equal(memberships[0].role, 'owner');

        // THEN a success status code is received as response (200: OK)
        assert.equal(response.status, 200);
    });
});