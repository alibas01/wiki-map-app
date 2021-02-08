const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'wikimap'
});

const getAllLocations = function() {
  return pool.query(`SELECT id, name, lat, long, description FROM locations LIMIT 5;`).then(res => {
    return res.rows;
  });
};

exports.getAllLocations = getAllLocations;
