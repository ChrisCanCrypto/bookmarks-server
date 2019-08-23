const app = require('../src/app');
chai.use(chaiHttp);
chai.should();

describe('App', () => {
	it('Does not allow unauthorized access to the site', () => {
		return supertest(app)
			.get('/')
			.expect(401);
	});
	it('GET / responds with 200 containing "Hello, bookmarks!"', () => {
		return supertest(app)
			.get('/')
			.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
			.expect(200, 'Hello, bookmarks!');
	});
});
