// Required dependencies
const express = require('express');
const BookmarksService = require('./BookmarksService');
const xss = require('xss');

// bookmarks-router setup
const bookmarksRouter = express.Router();
const bodyParser = express.json();

const serializeBookmark = ({ id, title, url, description, rating }) => ({
	id: Number(id),
	title: xss(title),
	url: url,
	description: xss(description),
	rating: Number(rating)
});

//Endpoints
bookmarksRouter
	.route('/')
	.get(handleGetBookmarks)
	.post(bodyParser, handlePostNewBookmark);

bookmarksRouter
	.route('/:id')
	.all(handleFindBookmarkById)
	.get(handleGetBookmarkById)
	.delete(handleDeleteBookmarkById);

//Endpoint Functions
function handleGetBookmarks(req, res, next) {
	const knexInstance = req.app.get('db');
	BookmarksService.getAllBookmarks(knexInstance)
		.then(bookmarks => {
			res.json(bookmarks.map(serializeBookmark));
		})
		.catch(next);
}

function handlePostNewBookmark(req, res, next) {
	const knexInstance = req.app.get('db');
	const { title, url, description, rating } = req.body;
	const newBookmark = { title, url, description, rating };

	for (const [key, value] of Object.entries(newBookmark)) {
		if (value == null) {
			return res.status(400).json({
				error: { message: `Missing '${key}' in request body` }
			});
		}
	}

	if (![1, 2, 3, 4, 5].includes(rating)) {
		return res.status(400).json({
			error: { message: `Rating must be a number between 1-5. You posted: ${rating}` }
		});
	}

	BookmarksService.postNewBookmark(knexInstance, newBookmark)
		.then(bookmark => {
			res.status(201)
				.location(`/bookmarks/${bookmark.id}`)
				.json(serializeBookmark(bookmark));
		})
		.catch(next);
}

function handleFindBookmarkById(req, res, next) {
	const knexInstance = req.app.get('db');
	const { id } = req.params;
	BookmarksService.getBookmarkById(knexInstance, id)
		.then(bookmark => {
			if (!bookmark) {
				return res.status(404).json({ error: { message: `Bookmark doesn't exist` } });
			}
			res.bookmark = bookmark;
			next();
		})
		.catch(next);
}

function handleGetBookmarkById(req, res, next) {
	res.json(serializeBookmark(res.bookmark));
}

function handleDeleteBookmarkById(req, res) {
	const knexInstance = req.app.get('db');
	const { id } = req.params;

	BookmarksService.deleteBookmark(knexInstance, id)
		.then(() => {
			res.status(204).end();
		})
		.catch(next);
}

module.exports = bookmarksRouter;
