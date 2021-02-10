
module.exports = (db) => {
// getting map_id names by user_id, returns and array of map_ids
const getMapIdbyUserId = function(user_id) {
  return db.query(`
    SELECT id
    FROM maps
    WHERE user_id = ${user_id};
    `)
  .then(res => {
    result = [];
    res.rows.forEach(map => {
      result.push(map.id);
      return result;
    })
  })
  .catch(err => console.error('query error', err.stack));
}


// getting map information by map_id, returns {username: alibas, title:"touristic places", city: "Toronto", ago: "5 days ago", isPublic: "false"}
const getMapsbyId = function(map_id) {
  return db.query(`
    SELECT username, title, city, last_updated_at, isPublic
    FROM maps JOIN users ON user_id = users.id
    WHERE maps.id = ${map_id};
    `)
  .then(res => {
    return res.rows[0];
  })
  .catch(err => console.error('query error', err.stack));
};


// returns an array of users as an object [ {username: alibas, email: alibas01@gmail.com}, {username: alibas, email: alibas01@gmail.com}]
const getUsers = function() {
  return db.query(`
    SELECT username, email
    FROM users;
    `)
  .then(res => {
    let result = [];
    for (let user of res.rows) {
      result.push(user);
    }
    return result;
  })
  .catch(err => console.error('query error', err.stack));
}


// inserts user into users table. inputObj = {username: 'afdfg', email: 'aghg@dfhhn.com', password:'bcryptedPassword' }
const newUser = function(inputObj) {
  return db.query(`
    INSERT INTO users (
    username, email, password)
    VALUES (
    $1, $2, $3)
    RETURNING *;
    `, [`${inputObj.username}`, `${inputObj.email}`, `${inputObj.password}`])
  .then(user => user.rows[0])
  .catch(err => console.error('query error', err.stack));
}


// inserts point into points table
const newPoint = function(inputObj) {
  return db.query(`
    INSERT INTO locations (name, map_id, lat, long, user_id, picture_url, description, website)
    VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
    `, [`${inputObj.name}`, `${inputObj.map_id}`, `${inputObj.lat}`, `${inputObj.long}`, `${inputObj.user_id}`, `${inputObj.picture_url}`, `${inputObj.description}`, `${inputObj.website}`])
  .then(user => user.rows[0])
  .catch(err => console.error('query error', err.stack));
}

// inserts map into maps table
const newMap = function(inputObj) {
  return db.query(`
    INSERT INTO maps (user_id, title, city, last_updated_at, isPublic)
    VALUES (
    $1, $2, $3, $4, $5)
    RETURNING *;
    `, [`${inputObj.user_id}`, `${inputObj.title}`, `${inputObj.city}`, `${inputObj.last_updated_at}`, `${inputObj.isPublic}`])
  .then(user => user.rows[0])
  .catch(err => console.error('query error', err.stack));
}




// inserts favourite into favourites table
const newLike = function(inputObj) {
  return db.query(`
    INSERT INTO favourites (
    user_id, map_id)
    VALUES (
    $1, $2)
    RETURNING *;
    `, [`${inputObj.user_id}`, `${inputObj.map_id}`])
  .then(user => user.rows[0])
  .catch(err => console.error('query error', err.stack));
}

const search = function(city, description) {
  return db.query(`
    SELECT * FROM locations
    JOIN maps ON locations.map_id=maps.id
    WHERE locations.description LIKE $2 AND maps.city=$1
  `, [`${city}`, `%${description}%`])
  .then(res => res.rows)
  .catch(err => console.error('query error', err.stack));
}

const getFavouritesById = function(user_id) {
  return db.query(`
  SELECT * FROM maps
  JOIN favourites ON favourites.map_id=maps.id
  WHERE favourites.user_id = ${user_id};
  `)
  .then(data => data.rows)
};

const getAllLocations = function(map_id) {
  return db.query(`
  SELECT id, name, lat, long, description FROM locations
  WHERE map_id = ${map_id};
  `)
  .then(data => data.rows)
};

return {getAllLocations, getMapIdbyUserId, getMapsbyId, getUsers, newUser, newMap, newPoint, newLike, getFavouritesById, search}

}
