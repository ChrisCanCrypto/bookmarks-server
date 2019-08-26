const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmarks.fixtures');
chai.use(chaiHttp);
chai.should();

describe('Bookmarks Endpoints', function() {
	let db;

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

	//Testing endpoints for unauthorized requests
	describe('Unauthorized requests', () => {
		const testBookmarks = makeBookmarksArray();

		beforeEach('insert bookmarks', () => {
			return db.into('bookmarks').insert(testBookmarks);
		});

		it('responds with 401 for GET /bookmarks', done => {
			chai.request(app)
				.get('/bookmarks')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.error.should.equal('Unauthorized request');
					done();
				});
		});

		it('responds with 401 for GET /bookmarks/:id', done => {
			chai.request(app)
				.get('/bookmarks/1')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.error.should.equal('Unauthorized request');
					done();
				});
		});

		it('responds with 401 for DELETE /bookmarks/:id', done => {
			chai.request(app)
				.delete('/bookmarks/1')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.error.should.equal('Unauthorized request');
					done();
				});
		});

		it('responds with 401 for POST /bookmarks', done => {
			chai.request(app)
				.post('/bookmarks/1')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.error.should.equal('Unauthorized request');
					done();
				});
		});
	});

	//Testing GET /bookmarks endpoints
	describe('GET /bookmarks', () => {
		//Testing with no bookmarks in the db
		context('given there are no bookmarks in the db', () => {
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

		//Testing for bookmarks in the db
		context('given there are bookmarks in the db', () => {
			const testBookmarks = makeBookmarksArray();
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

		//Testing XSS handling
		context(`Given an XSS attack bookmark`, () => {
			const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();

			beforeEach('insert malicious bookmark', () => {
				return db.into('bookmarks').insert([maliciousBookmark]);
			});

			it('removes XSS attack content', done => {
				chai.request(app)
					.get('/bookmarks')
					.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
					.end((err, res) => {
						res.body[0].title.should.equal(expectedBookmark.title);
						res.body[0].description.should.equal(expectedBookmark.description);
						done();
					});
			});
		});
	});

	//Testing GET /bookmarks/:id endpoints
	describe('GET /bookmarks/:id', () => {
		const testBookmarks = makeBookmarksArray();

		beforeEach('insert articles', () => {
			return db.into('bookmarks').insert(testBookmarks);
		});

		//Testing for article id not found in the db
		context(`Given an id that doesn't exist`, () => {
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

		//Testing for valid bookmark id
		context('Given an id that does exist', () => {
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

	//Testing POST /bookmarks endpoints
	describe(`POST /bookmarks`, () => {
		//Testing valid bookmark post
		context('If bookmark is valid', () => {
			const newBookmark = {
				title: 'test title',
				url: 'www.testulr.com',
				description: 'test desc',
				rating: 4
			};

			it('should respond with 201 and post the new bookmark', done => {
				chai.request(app)
					.post('/bookmarks')
					.set('Authorization', 'Berer b476ec9a-22d8-4382-969a-064b208823de')
					.send(newBookmark)
					.end((err, res) => {
						res.should.have.status(201);
						res.body.title.should.equal(newBookmark.title);
						res.body.description.should.equal(newBookmark.description);
						res.body.url.should.equal(newBookmark.url);
						res.body.rating.should.equal(newBookmark.rating);
						res.body.id.should.be.a('number');
						done();
					});
			});
		});

		//Testing for posts without required fields
		context('If a required field is missing', () => {
			const requiredFields = ['title', 'url', 'rating', 'description'];
			requiredFields.forEach(field => {
				const newBookmark = {
					title: 'test title',
					url: 'www.testulr.com',
					description: 'test desc',
					rating: 4
				};

				it(`responds with 400 and an error message when the '${field}' is missing`, done => {
					delete newBookmark[field];

					chai.request(app)
						.post('/bookmarks')
						.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
						.send(newBookmark)
						.end((err, res) => {
							res.should.have.status(400);
							res.body.error.message.should.equal(
								`Missing '${field}' in request body`
							);
							done();
						});
				});
			});
		});

		//Testing if rating param is not a number between 1-5
		context('if the rating is not a number between 1-5', () => {
			const badRatingBookmark = {
				title: 'test title',
				url: 'www.testulr.com',
				description: 'test desc',
				rating: false
			};

			it('responds with 400 and an error message', done => {
				chai.request(app)
					.post('/bookmarks')
					.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
					.send(badRatingBookmark)
					.end((err, res) => {
						res.should.have.status(400);
						res.body.error.message.should.equal(
							`Rating must be a number between 1-5. You posted: ${badRatingBookmark.rating}`
						);
						done();
					});
			});
		});

		//Testing XSS removal from posts
		context('If a user posts a malicious bookmark', () => {
			const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();

			it('remove xss content from the response', done => {
				chai.request(app)
					.post('/bookmarks')
					.set('Authorization', 'Bearer b476ec9a-22d8-4382-969a-064b208823de')
					.send(maliciousBookmark)
					.end((err, res) => {
						res.should.have.status(201);
						res.body.title.should.equal(expectedBookmark.title);
						res.body.description.should.equal(expectedBookmark.description);
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
