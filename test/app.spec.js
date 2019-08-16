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

describe('/bookmarks', () => {
	it('GET /bookmarks responds with a 200 and an array of bookmark objects', done => {
		chai.request(app)
			.get('/bookmarks')
			.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
			.end((err, res) => {
				res.should.have.status(200);
				res.body[0].id.should.be.a('number');
				res.body[0].rating.should.be.a('number');
				res.body[0].title.should.be.a('string');
				res.body[0].url.should.be.a('string');
				res.body[0].description.should.be.a('string');
				done();
			});
	});
});
