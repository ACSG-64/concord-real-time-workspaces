const { expect, assert } = require('chai');
const chai = require('chai');
const server = require('../../app');
const orm = require('../../db/orm');

chai.use(require('chai-http'));

const userDataForm = {
    first_name: 'John',
    last_name: 'Doe',
    user_name: 'jdoe64',
    password: 'LongPa$$word28',
    email: 'jdoe@test.com'
};

describe('User login', () => {
    let agent;

    beforeEach(async () => {
        await orm.sync({ force: true }); // reset the DB
        agent = await chai.request.agent(server);
        // Register a user
        await agent
            .post('/api/auth/register')
            .type('form')
            .send(userDataForm);
    });

    afterEach(async () => {
        await agent.close(); // shut down the server
    });

    it('Login to an existent account using EMAIL', async () => {
        // GIVEN credentials of an existent account
        const userDataLoginForm = {
            user_id: userDataForm.email,
            password: userDataForm.password,
        };

        // WHEN that data is sent to the API endpoint
        const response = await agent
            .post('/api/auth/login')
            .type('form')
            .send(userDataLoginForm);

        // THEN the auth cookie is set
        expect(response).to.have.cookie('concord_auth');
    });

    it('Login to an existent account using USER NAME', async () => {
        // GIVEN credentials of an existent account
        const userDataLoginForm = {
            user_id: userDataForm.user_name,
            password: userDataForm.password,
        };

        // WHEN that data is sent to the API endpoint
        const response = await agent
            .post('/api/auth/login')
            .type('form')
            .send(userDataLoginForm);

        // THEN the auth cookie is set
        expect(response).to.have.cookie('concord_auth');
    });

    it('Login to an inexistent account', async () => {
        // GIVEN credentials of an inexistent account
        const inexistentUser = {
            user_id: 'janeRoe33',
            password: 'LongPa$$word28',
        };

        // WHEN that data is sent to the API endpoint
        const response = await agent
            .post('/api/auth/login')
            .type('form')
            .send(inexistentUser);

        // THEN an error status code should be received (404: not found)
        assert.equal(response.status, 404);
        // THEN the auth cookie is not set
        expect(response).not.to.have.cookie('concord_auth');
    });

    it('Login to an existent account but using an incorrect password', async () => {
        // GIVEN credentials of an existent account
        const userDataLoginForm = {
            user_id: userDataForm.user_name,            
            password: 'dummy password',
        };

        // WHEN that data is sent to the API endpoint
        const response = await agent
            .post('/api/auth/login')
            .type('form')
            .send(userDataLoginForm);

        // THEN an error status code should be received (404: not found)
        assert.equal(response.status, 404);
        // THEN the auth cookie is not set
        expect(response).not.to.have.cookie('concord_auth');
    });
});
