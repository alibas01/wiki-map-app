
module.exports = (db) => {
// getting map_id names by user_id, returns and array of map_ids
  const getMapIdbyUserId = function(user_id) {
    return db.query(`
    SELECT max(id)
    FROM maps
    WHERE user_id = ${user_id};
    `)
  .then(res => res.rows[0].max)
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
    SELECT id, username, email, password
    FROM users;
    `)
      .then(res => res.rows);
  };


  const findUserIdByName = function(user) {
    return db.query(`
    SELECT id
    FROM users
    WHERE username = $1;
    `, [`${user}`])
      .then(res => res.rows[0].id);
  };

  // checks if the hashed password matches
  const getPassword = function(user) {
    return db.query(`
    SELECT password
    FROM users
    WHERE username = $1;
    `, [`${user}`])
      .then(res => res.rows[0].password);
  };

  // checks if a user registered before
  const isRegisteredBefore = function(user) {
    return db.query(`
    SELECT count(id)
    FROM users
    WHERE username = $1;
    `, [`${user}`])
      .then(res => {
        if (Number(res.rows[0].count)) {
          return true;
        } else {
          return false;
        }
      });
  };


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
  };

  // updates the username only
  const updateUsername = function(new_user, user) {
    return db.query(`
    UPDATE users SET username = $1
    WHERE username = $2;
    `, [`${new_user}`, `${user}`]);
  };
  // updates the email only
  const updateEmail = function(new_email, user) {
    return db.query(`
    UPDATE users SET email = $1
    WHERE username = $2;
    `, [`${new_email}`, `${user}`]);
  };
  // updates the password only
  const updatePass = function(new_pass, user) {
    return db.query(`
    UPDATE users SET password = $1
    WHERE username = $2;
    `, [`${new_pass}`, `${user}`]);
  };

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
  };

  // inserts map into maps table
  const newMap = function(inputObj) {
    return db.query(`
    INSERT INTO maps (user_id, title, city, isPublic)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `, [`${inputObj.user_id}`, `${inputObj.title}`, `${inputObj.city}`, `${inputObj.isPublic}`])
      .then(user => user.rows[0])
      .catch(err => console.error('query error', err.stack));
  };




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
  };

const search = function(city, description) {
  return db.query(`
    SELECT locations.id, locations.map_id, locations.name, locations.lat, locations.long, locations.description FROM locations
    JOIN maps ON locations.map_id=maps.id
    WHERE locations.description LIKE $2 AND maps.city=$1;
  `, [`${city}`, `%${description}%`])
  .then(res => {
    console.log(res.rows);
    return res.rows;
  })
  .catch(err => console.error('query error', err.stack));
}

const getFavouritesByUserName = function(user_name) {
  return db.query(`
    SELECT maps.id as map_id, maps.title, maps.city, maps.isPublic, locations.id as location_id, users.id as user_id FROM maps
    JOIN favourites ON favourites.map_id=maps.id
    JOIN locations ON locations.map_id=maps.id
    JOIN users ON favourites.user_id=users.id
    WHERE users.username = '${user_name}';
  `)
  .then(data => data.rows)
};

const getAllLocationsByUserName = function(username) {
  return db.query(`
  SELECT locations.id, name, lat, long, description, locations.map_id FROM locations
  JOIN users ON users.id=locations.user_id
  WHERE users.username = '${username}';
  `)
  .then(data => data.rows)
};

const getAllLocationsByMapId = function(map_id) {
  return db.query(`
    SELECT locations.id, name, lat, long, description, locations.map_id FROM locations
    JOIN maps ON maps.id=locations.map_id
    WHERE maps.id = '${map_id}';
  `)
  .then(data => data.rows)
}

const getAllMapsByUserName = function(username) {
  return db.query(`
  SELECT maps.id, title, city, locations.id as location_id FROM maps
  JOIN users ON users.id=maps.user_id
  JOIN locations ON locations.map_id=maps.id
  WHERE NOT users.username='${username}' AND isPublic=true
  AND maps.id NOT IN(
    SELECT favourites.map_id FROM favourites
    JOIN users ON users.id=favourites.user_id
    WHERE users.username='${username}'
    );
  `).then(data => {
    console.log(data);
    return data.rows;
  });
}

const getAllMaps = function(){
  return db.query(`
  SELECT maps.id, title, city FROM maps WHERE isPublic=true;
  `).then(data => {
    return data.rows
  })
}

const getAllLocations = function(map_id) {
  return db.query(`
    SELECT id, name, lat, long, description FROM locations
    WHERE map_id = ${map_id};
  `).then(data => {
      console.log(data);
      return data.rows;
    });
};

const getIdByUserName = function(user_name){
  return db.query(`
    SELECT id FROM users
    WHERE users.username='${user_name}';
  `).then(data => {
    return data.rows;
  })
}

const deleteFavourites = function(inputObj){
  return db.query(`
    DELETE FROM favourites
    WHERE favourites.user_id = $1 AND favourites.map_id = $2;
    `, [`${inputObj.user_id}`, `${inputObj.map_id}`])
  .catch(err => console.error('query error', err.stack));
}

return {getAllMaps, getAllLocationsByMapId, deleteFavourites, getIdByUserName, getAllLocations, getAllMapsByUserName, getMapIdbyUserId, getMapsbyId, getUsers, newUser, newMap, newPoint, newLike, getFavouritesByUserName, search, findUserIdByName, getPassword, isRegisteredBefore, updateUsername, updateEmail, updatePass, getAllLocationsByUserName}

};
