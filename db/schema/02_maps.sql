DROP TABLE IF EXISTS maps CASCADE;

CREATE TABLE maps (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  last_updated_at TIMESTAMP,
  isPublic BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE maps ALTER COLUMN last_updated_at SET DEFAULT now();