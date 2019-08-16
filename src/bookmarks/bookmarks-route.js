// Required dependencies
const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const { bookmarks } = require('../store');

// bookmarks-router setup
const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
	.route('/bookmarks')
	.get(handleGetBookmarks)
	.post(bodyParser, handlePostNewBookmark);

function handleGetBookmarks(req, res) {
	res.json(bookmarks);
}

function handlePostNewBookmark(req, res) {}

bookmarksRouter
	.route('/bookmarks/:id')
	.get(handleGetBookmarkWithId)
	.delete(handleDeleteBookmarkWithId);

function handleGetBookmarkWithId(req, res) {}

function handleDeleteBookmarkWithId(req, res) {}

module.exports = bookmarksRouter;
