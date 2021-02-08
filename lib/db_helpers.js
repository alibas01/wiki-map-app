const { Client } = require('pg');

const pool = new Client({
  user: 'alibas01',
  password: '123',
  host: 'localhost',
  database: 'midterm'
});

pool.connect()
.then(console.log(`connected`))
.catch((err) => {
  if(err) throw new Error(err);
  console.log('wikimapapp database connected...!')
})

console.log(`here right`)
pool.query(`
SELECT id, title
FROM maps
LIMIT $1;
`, [10])
.then(res => {
  res.rows.forEach(map => {
    console.log(`${map.title} has an id of ${map.id} and was .......`);
  })
});

const getAllLocations = function() {
  return pool.query(`SELECT id, name, lat, long, description FROM locations;`).then(res => {
    return res.rows;
  });
};

exports.getAllLocations = getAllLocations;


