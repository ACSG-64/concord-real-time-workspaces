const assert = require('chai').assert;
const chai = require('chai');
const server = require('../app');
const orm = require('../db/orm');
const { User } = require('../models/index');

chai.use(require('chai-http'));

describe('User registration', () => {
	let agent;

	const userDataForm = {
		first_name: 'John',
		last_name: 'Doe',
		user_name: 'jdoe64',
		password: 'LongPa$$word28',
		email: 'jdoe@test.com'
	};

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

		// THEN an error status code should be received
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

		// THEN an error status code should be received
		assert.equal(response.status, 409);
	});
});
