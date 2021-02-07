DROP TABLE IF EXISTS locations CASCADE;

CREATE TABLE locations (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  map_id INTEGER REFERENCES maps(id) ON DELETE CASCADE,
  lat DECIMAL NOT NULL,
  long DECIMAL NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

  picture_url VARCHAR(255) NOT NULL DEFAULT 'https://thumbnail.imgbin.com/0/9/7/imgbin-south-america-canada-organization-of-american-states-continent-map-canada-6PGHgTE8gvVsvPLhK5tpXfn2f_t.jpg',
  description TEXT,
  website VARCHAR(255) DEFAULT 'N/A'
);
