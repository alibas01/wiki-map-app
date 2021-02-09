const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'midterm'
});

const getAllLocations = function() {
  return pool.query(`SELECT id, name, lat, long, description, picture_url, website FROM locations LIMIT 10;`).then(res => {
    return res.rows;
  });
};

exports.getAllLocations = getAllLocations;
