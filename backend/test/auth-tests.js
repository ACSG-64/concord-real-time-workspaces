const { expect, assert } = require('chai');
const chai = require('chai');
const server = require('../app');
const orm = require('../db/orm');
const { User } = require('../models/index');

chai.use(require('chai-http'));

const userDataForm = {
    first_name: 'John',
    last_name: 'Doe',
    user_name: 'jdoe64',
    password: 'LongPa$$word28',
    email: 'jdoe@test.com'
};

describe('User registration', () => {
    let agent;

    before(async () => {
        await orm.sync({ force: true }); // reset the DB
        agent = chai.request.agent(server);
    });

    after(async () => {
        await agent.close(); // shut down the server
    });

    it('Register a user using invalid data', async () => {
        // GIVEN a set of invalid user data
        const invalidData = {
            first_name: 'Johnny',
            last_name: 'Doe',
            user_name: 'jdoe64',
            password: 'badpassword', // this should be rejected
            email: 'jdoe bad email', // this should be rejected
        };

        // WHEN that data is sent to the API endpoint
        const response = await agent
            .post('/api/auth/register')
            .type('form')
            .send(invalidData);

        // THEN an error status code should be received (404: bad request)
        assert.equal(response.status, 400);
        // THEN at least two errors should be received
        assert.isAtLeast(response.body.errors.length, 2);
    });

    it('Register a user', async () => {
        // GIVEN a set of valid user data

        // WHEN that data is sent to the API endpoint
        const response = await agent
            .post('/api/auth/register')
            .type('form')
            .send(userDataForm);

        // THEN an successful status code should be received
        assert.equal(response.status, 200);

        const record = await User.findOne();

        // THEN the user name in the database should be the same of the data sent
        assert.equal(userDataForm.user_name, record.user_name);
        // THEN the password in the database is hashed, thus it is not the equal to the textual password
        assert.notEqual(userDataForm.password, record.password);
    });

    it('Register the same user again', async () => {
        // GIVEN a set of user data that is already stored in the database

        // WHEN that data is sent to the API endpoint
        const response = await agent
            .post('/api/auth/register')
            .type('form')
            .send(userDataForm);

        // THEN an error status code should be received (409: conflict)
        assert.equal(response.status, 409);
    });
});


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
            ...userDataForm,
            user_id: userDataForm.email,
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
            ...userDataForm,
            user_id: userDataForm.user_name,
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
            first_name: 'Jane',
            last_name: 'Roe',
            user_name: 'jroe32',
            password: 'LongPa$$word28',
            email: 'jroe@test.com',
            user_id: 'janeRoe33'
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
});
