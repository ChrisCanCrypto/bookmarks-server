CREATE TABLE bookmarks(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    description TEXT,
    rating INT NOT NULL
);