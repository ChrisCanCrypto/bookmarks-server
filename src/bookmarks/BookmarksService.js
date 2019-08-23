const BookmarksService = {
	getAllBookmarks(knex) {
		return knex.select('*').from('bookmarks');
	},

	getBookmarkById(knex, id) {
		return knex
			.from('bookmarks')
			.select('*')
			.where('id', id)
			.first();
	}
};

module.exports = BookmarksService;