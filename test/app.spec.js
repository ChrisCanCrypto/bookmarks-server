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
	it('POST /bookmarks responds with 400 if no title given', done => {
		chai.request(app)
			.post('/bookmarks')
			.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
			.end((err, res) => {
				res.should.have.status(400);
				done();
			});
	});
	it('POST /bookmarks should respond with 201 if new bookmark is added correctly', done => {
		chai.request(app)
			.post('/bookmarks')
			.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
			.send({
				'title': 'book',
				'url': 'https://www.amazon.com',
				'description': "'the book of amazon'",
				'rating': 5
			})
			.end((err, res) => {
				res.should.have.status(201);
				done();
			});
	});
});

describe('/bookmarks/:id', () => {
	describe('GET ', () => {
		it('GET /bookmarks/:id should respond with 404 if the bookmark id doesnt exist', done => {
			chai.request(app)
				.get('/bookmarks/eoirhegtiuhe')
				.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
				.end((err, res) => {
					res.should.have.status(404);
					done();
				});
		});
		it('GET /bookmarks/:id should respond with 200 and the bookmark object', done => {
			chai.request(app)
				.get('/bookmarks/1')
				.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					done();
				});
		});
	});
	describe('DELETE ', () => {
		it('DELETE /bookmarks/:id should respond with 404 if the bookmark id doesnt exist', done => {
			chai.request(app)
				.delete('/bookmarks/eoirhegtiuhe')
				.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
				.end((err, res) => {
					res.should.have.status(404);
					done();
				});
		});
		it('DELETE /bookmarks/:id should respond with status 204 if the bookmark is successfully deleted', done => {
			chai.request(app)
				.delete('/bookmarks/1')
				.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
				.end((err, res) => {
					res.should.have.status(204);
					done();
				});
		});
	});
});
