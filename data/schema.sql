DROP TABLE IF EXISTS  list;

CREATE TABLE list (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    img VARCHAR(255),
    description TEXT
);
