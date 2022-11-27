const { expect, assert } = require('chai');
const chai = require('chai');
const argon2 = require('argon2');
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

describe('Edit public details of an account', () => {
    let agent;

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

    afterEach(async () => {
        await agent.close(); // shut down the server
    });

    it('Edit all details', async () => {
        // GIVEN a set of data to update
        const details = {
            first_name: 'Richard',
            last_name: 'Roe',
            user_name: 'rich24',
            email: 'rich@test.com',
            password: userDataForm.password
        };

        // WHEN this data is sent to the server
        await agent
            .put('/api/account/update')
            .type('form')
            .send(details);

        // THEN the account details should be updated
        const record = await User.findOne();
        assert.equal(record.first_name, details.first_name);
        assert.equal(record.last_name, details.last_name);
        assert.equal(record.user_name, details.user_name);
        assert.equal(record.email, details.email);
    });

    it('Edit ONLY the user name', async () => {
        // GIVEN a set of data to update
        const details = {
            ...userDataForm,
            user_name: 'name24',
        };

        // WHEN this data is sent to the server
        await agent
            .put('/api/account/update')
            .type('form')
            .send(details);

        // THEN the only the account user name should be updated
        const record = await User.findOne();
        assert.equal(record.first_name, userDataForm.first_name);
        assert.equal(record.last_name, userDataForm.last_name);
        assert.notEqual(record.user_name, userDataForm.user_name);
        assert.equal(record.user_name, details.user_name); // the user name
        assert.equal(record.email, userDataForm.email);
    });

    it('Try to edit details but passing invalid data', async () => {
        // GIVEN a set of data to update
        const details = {
            ...userDataForm,
            user_name: 'LOOOOOOOOOOOOOOOOOOOONG USER NAME', // invalid user name
        };

        // WHEN this data is sent to the server
        const response = await agent
            .put('/api/account/update')
            .type('form')
            .send(details);

        // THEN the account details should NOT be updated
        const record = await User.findOne();
        assert.equal(record.first_name, userDataForm.first_name);
        assert.equal(record.last_name, userDataForm.last_name);
        assert.equal(record.user_name, userDataForm.user_name);
        assert.notEqual(record.user_name, details.user_name); // the user name
        assert.equal(record.email, userDataForm.email);
        // and a HTTP error code should be received (400: Bad request)
        assert.equal(response.status, 400);
    });    

    it('Try to edit details but using a wrong password', async () => {
        // GIVEN a set of data to update
        const details = {
            ...userDataForm,
            user_name: 'name24', // edit this detail
            password: 'INCORRECT PASSWORD' // wrong password
        };

        // WHEN this data is sent to the server
        const response = await agent
            .put('/api/account/update')
            .type('form')
            .send(details);

        // THEN the account details should NOT be updated
        const record = await User.findOne();
        assert.equal(record.first_name, userDataForm.first_name);
        assert.equal(record.last_name, userDataForm.last_name);
        assert.equal(record.user_name, userDataForm.user_name);
        assert.notEqual(record.user_name, details.user_name); // the user name
        assert.equal(record.email, userDataForm.email);
        // and a HTTP error code should be received (403: Forbidden)
        assert.equal(response.status, 403);
    });

    it('Try to edit details without being authenticated', async () => {
        // GIVEN a set of data to update
        const details = {
            ...userDataForm,
            user_name: 'name24', // only the user name
        };

        // WHEN this data is sent to the server but without the auth cookie
        const response = await chai.request(server)
            .put('/api/account/update')
            .type('form')
            .send(details);
        expect(response).to.not.have.cookie('concord_auth'); // confirm there is no cookie

        // THEN the data is not updated
        const record = await User.findOne();
        assert.notEqual(record.user_name, details.user_name);
        // and a HTTP error code should be received (401: Unauthorized)
        assert.equal(response.status, 401);
    });
});

describe('Update password of an account', () => {
    let agent;

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

    afterEach(async () => {
        await agent.close(); // shut down the server
    });

    it('Update the password', async () => {
        // GIVEN a new password to be updated
        const details = {
            password: userDataForm.password,
            new_password: 'Blood@83n1f9'
        };
        // and the original hashed password
        const { password: old_password_hash } = await User.findOne();

        // WHEN this data is sent to the server
        await agent
            .put('/api/account/update/password')
            .type('form')
            .send(details);

        // THEN the password is updated
        const record = await User.findOne();
        assert.notEqual(record.password, old_password_hash);
        assert.equal(await argon2.verify(record.password, details.new_password), true);
    });

    it('Try to update the password but passing an invalid/weak new password', async () => {
        // GIVEN a new password to be updated
        const details = {
            password: userDataForm.password,
            new_password: 'bobobobobobob' // this password should be rejected
        };
        // and the original hashed password
        const { password: old_password_hash } = await User.findOne();

        // WHEN this data is sent to the server
        const response = await agent
            .put('/api/account/update/password')
            .type('form')
            .send(details);

        // THEN the password is NOT updated
        const record = await User.findOne();
        assert.equal(record.password, old_password_hash);
        assert.equal(await argon2.verify(record.password, details.new_password), false);
        // and a HTTP error code should be received (400: Bad request)
        assert.equal(response.status, 400);
    });    

    it('Try to update the password but using an incorrect password as the current one', async () => {
        // GIVEN a new password to be updated
        const details = {
            password: 'I FORGOT', // incorrect password
            new_password: 'Blood@83n1f9'
        };
        // and the original hashed password
        const { password: old_password_hash } = await User.findOne();

        // WHEN this data is sent to the server
        const response = await agent
            .put('/api/account/update/password')
            .type('form')
            .send(details);

        // THEN the password is NOT updated
        const record = await User.findOne();
        assert.equal(record.password, old_password_hash);
        assert.equal(await argon2.verify(record.password, details.new_password), false);
        // and a HTTP error code should be received (403: Forbidden)
        assert.equal(response.status, 403);
    });   

    it('Try to update the password using the current one', async () => {
        // GIVEN a new password to be updated
        const details = {
            password: userDataForm.password,
            new_password: userDataForm.password,
        };
        // and the original hashed password
        const { password: old_password_hash } = await User.findOne();

        // WHEN this data is sent to the server
        const response = await agent
            .put('/api/account/update/password')
            .type('form')
            .send(details);

        // THEN the password is NOT updated
        const record = await User.findOne();
        assert.equal(record.password, old_password_hash);
        assert.equal(await argon2.verify(record.password, details.new_password), true);
        // and a HTTP error code should be received (409: Conflict)
        assert.equal(response.status, 409);
    });

    it('Try to edit the password but without being authenticated', async () => {
        // GIVEN a new password to be updated
        const details = {
            password: userDataForm.password,
            new_password: 'Blood@83n1f9'
        };
        // and the original hashed password
        const { password: old_password_hash } = await User.findOne();

        // WHEN this data is sent to the server but without the auth cookie
        const response = await chai.request(server)
            .put('/api/account/update/password')
            .type('form')
            .send(details);
        expect(response).to.not.have.cookie('concord_auth'); // confirm there is no cookie

        // THEN the password is NOT updated
        const record = await User.findOne();
        assert.equal(record.password, old_password_hash);
        assert.notEqual(await argon2.verify(record.password, details.new_password), true);
        // and a HTTP error code should be received (401: Unauthorized)
        assert.equal(response.status, 401);
    });
});