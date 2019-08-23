const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');
chai.use(chaiHttp);
chai.should();

describe('Bookmarks Endpoints', function() {
	let db;
	const testBookmarks = makeBookmarksArray();
	before('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DB_URL
		});
		app.set('db', db);
	});

	after('disconnect from the db', () => db.destroy());

	before('clean the table', () => db('bookmarks').truncate());

	afterEach('cleanup', () => db('bookmarks').truncate());

	describe('GET /bookmarks', () => {
		context('given no bookmarks', () => {
			it('responds with 200 and an empty list', done => {
				chai.request(app)
					.get('/bookmarks')
					.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.empty;
						done();
					});
			});
		});
		context('given there are bookmarks in the db', () => {
			beforeEach('insert bookmarks', () => {
				return db.into('bookmarks').insert(testBookmarks);
			});

			it('responds with 200 and a list of bookmarks', done => {
				chai.request(app)
					.get('/bookmarks')
					.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
					.end((err, res) => {
						res.should.have.status(200);
						res.body.length.should.equal(4);
						res.body.should.be.an('array');
						res.body[0].rating.should.equal(testBookmarks[0].rating);
						res.body.should.deep.equal(testBookmarks);
						done();
					});
			});
		});
	});

	describe('GET /bookmarks/:id', () => {
		context('Given an id that doesnt exist', () => {
			it('should respond with 404', done => {
				chai.request(app)
					.get('/bookmarks/77777')
					.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
					.end((err, res) => {
						res.should.have.status(404);
						done();
					});
			});
		});
		context('Given an id that does exist', () => {
			beforeEach('insert articles', () => {
				return db.into('bookmarks').insert(testBookmarks);
			});
			it('should respond with a 200 and the requested bookmark', done => {
				const bookmarkId = 2;
				const expectedBookmark = testBookmarks[bookmarkId - 1];
				chai.request(app)
					.get(`/bookmarks/${bookmarkId}`)
					.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.deep.equal(expectedBookmark);
						done();
					});
			});
		});
	});
});

// describe('/bookmarks', () => {
// 	it('POST /bookmarks responds with 400 if no title given', done => {
// 		chai.request(app)
// 			.post('/bookmarks')
// 			.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
// 			.end((err, res) => {
// 				res.should.have.status(400);
// 				done();
// 			});
// 	});
// 	it('POST /bookmarks should respond with 201 if new bookmark is added correctly', done => {
// 		chai.request(app)
// 			.post('/bookmarks')
// 			.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
// 			.send({
// 				title: 'book',
// 				url: 'https://www.amazon.com',
// 				description: "'the book of amazon'",
// 				rating: 5
// 			})
// 			.end((err, res) => {
// 				res.should.have.status(201);
// 				done();
// 			});
// 	});
// });

// describe('/bookmarks/:id', () => {
// 	describe('GET ', () => {
// 		it('GET /bookmarks/:id should respond with 404 if the bookmark id doesnt exist', done => {
// 			chai.request(app)
// 				.get('/bookmarks/eoirhegtiuhe')
// 				.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
// 				.end((err, res) => {
// 					res.should.have.status(404);
// 					done();
// 				});
// 		});
// 		it('GET /bookmarks/:id should respond with 200 and the bookmark object', done => {
// 			chai.request(app)
// 				.get('/bookmarks/1')
// 				.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
// 				.end((err, res) => {
// 					res.should.have.status(200);
// 					res.body.should.be.a('object');
// 					done();
// 				});
// 		});
// 	});
// 	describe('DELETE ', () => {
// 		it('DELETE /bookmarks/:id should respond with 404 if the bookmark id doesnt exist', done => {
// 			chai.request(app)
// 				.delete('/bookmarks/eoirhegtiuhe')
// 				.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
// 				.end((err, res) => {
// 					res.should.have.status(404);
// 					done();
// 				});
// 		});
// 		it('DELETE /bookmarks/:id should respond with status 204 if the bookmark is successfully deleted', done => {
// 			chai.request(app)
// 				.delete('/bookmarks/1')
// 				.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
// 				.end((err, res) => {
// 					res.should.have.status(204);
// 					done();
// 				});
// 		});
// 	});
// });
