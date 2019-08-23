function makeBookmarksArray() {
	return [
		{
			id: 1,
			title: 'Book 1',
			url: 'https://www.amazon.com',
			description: 'the book of amazon',
			rating: 5
		},
		{
			id: 2,
			title: 'Book 2',
			url: 'https://facebook.com',
			description: 'the book of facebook',
			rating: 3
		},
		{
			id: 3,
			title: 'Book 3',
			url: 'https://www.yahoo.com',
			description: 'the book of yahoo',
			rating: 9
		},
		{
			id: 4,
			title: 'Book 4',
			url: 'https://google.com',
			description: 'the book of google',
			rating: 1
		}
	];
}

function makeMaliciousBookmark() {
	const maliciousBookmark = {
		id: 911,
		title: 'Naughty naughty very naughty <script>alert("xss");</script>',
		url: 'https://www.hackers.com',
		description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
		rating: 1
	};
	const expectedBookmark = {
		...maliciousBookmark,
		title: 'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
		description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
	};
	return {
		maliciousBookmark,
		expectedBookmark
	};
}
module.exports = {
	makeBookmarksArray,
	makeMaliciousBookmark
};
