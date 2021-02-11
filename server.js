/* eslint-disable camelcase */
// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');


// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect().then(console.log('database connection established👌'))
db.query(`SELECT id FROM users`).then(data => console.log(data.rows));

// Helper functions
const db_helpers = require('./lib/db_helpers')(db);
const getMapIdbyUserId = db_helpers.getMapIdbyUserId;
const getMapsbyId = db_helpers.getMapsbyId;
const getUsers = db_helpers.getUsers;
const newUser = db_helpers.newUser;
const newPoint = db_helpers.newPoint;
const newMap = db_helpers.newMap;
const newLike = db_helpers.newLike;
const getAllLocations = db_helpers.getAllLocations;
const findUserIdByName = db_helpers.findUserIdByName;
const getPassword = db_helpers.getPassword;
const isRegisteredBefore = db_helpers.isRegisteredBefore;
const getAllMaps = db_helpers.getAllMaps;
const getFavouritesByUserName = db_helpers.getFavouritesByUserName;
const search = db_helpers.search;
const getIdByUserName = db_helpers.getIdByUserName;
const deleteFavourites = db_helpers.deleteFavourites;

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const widgetsRoutes = require("./routes/widgets");
const loginRoute = require("./routes/login");
const logoutRoute = require("./routes/logout");
const registerRoute = require("./routes/register");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
app.use("/login", loginRoute(db));
app.use("/logout", logoutRoute(db));
app.use("/register", registerRoute(db));

// Note: mount other resources here, using the same pattern above

app.use('/public', express.static('public'));

app.get("/", (req, res) => {
  getAllMaps().then(rows => {
    const user = req.session['user_id'];
    const templateVars = { maps: rows, user };
    console.log(templateVars);
    res.render('index', templateVars);
  })
  .catch(err => res.status(500).send(err.stack));
});

app.get("/index_map", (req, res) => {
  const user = req.session['user_id'];
    getAllMaps(user).then(rows => {
    const templateVars = { maps: rows, user };
    res.status(200).json(templateVars);
  }).catch(err => res.status(500).send(err.stack));
});

app.get('/points', (req, res) => {
  const user = req.session['user_id'];
  getAllLocations(user).then(rows => {
    const locations = rows;
    console.log(locations)
    const templateVars = { greeting: 'welcome',locations: locations, user };
    res.render('points', templateVars);
  })
  .catch(err => res.status(500).send(err.stack));
});

app.get('/new-map', (req, res) => {
  const user = req.session['user_id'];
  res.render('new');
});

app.post('/new', (req, res) => {
  const currentPosition = JSON.parse(req.body.position);
  const newMap = {
    id: data.length,
    lat: currentPosition['lat'],
    long: currentPosition['lng'],
    name: req.body.title,
    description: req.body.description
  };
  res.redirect(`/detail/${newMap.id}`);
});

//see specific details
app.get('/detail/:map_id/:location_id', (req, res) => {
  let map_id = req.params.map_id || 4;
  getAllLocations(map_id).then(result => {
    const user = req.session['user_id'];
    const locations = result;
    const id_current = req.params.location_id;
    const templateVars = {
      locations,
      id_current,
      user,
    };
    res.render('detail', templateVars);
  });
});

app.get('/search', (req, res) => {
  const user = req.session['user_id'];
  const templateVars = { user }
  res.render('search', templateVars);
})

app.post('/search', (req, res) => {
  const city = req.body.city;
  const description = req.body.description;
  const user = req.session['user_id'];
  search(city, description).then(result => {
    // console.log(result);
    const templateVars = { greeting: 'welcome', locations: result, user };
    res.render('results', templateVars);
  })
})

app.get('/favorites', (req, res) => {
  const user = req.session['user_id'];
  getFavouritesByUserName(user).then(favourites => {
    const templateVars = {
      favourites,
      user
    }
    console.log(templateVars);
    res.render('favorites', templateVars);
  })
})

app.get('/favorites-ajax', (req, res) => {
  const user = req.session['user_id'];
  getFavouritesByUserName(user).then(favourites => {
    console.log(favourites);
    const templateVars = {
      favourites,
      user
    }
    console.log(templateVars);
    res.status(200).json(templateVars);
  })
})

app.post('/delete-favourites', (req, res) => {
  console.log(req.body.user_id, req.body.map_id);
  const inputObj = { user_id: Number(req.body.user_id), map_id: Number(req.body.map_id) };
  deleteFavourites(inputObj);
  res.render('/favorites');
})

app.get('/profile', (req, res) => {
  //get current user profile
  const user = req.session['user_id']; // this should be on all get routes
  res.render('profile');
});

app.post("/favourite", (req, res) => {
  console.log(req.body.user_name, req.body.map_id);
  getIdByUserName(req.body.user_name).then(result => {
    const inputObj = { user_id: result[0].id, map_id: Number(req.body.map_id)};
    console.log(inputObj);
    newLike(inputObj);
    res.render('/');
  })
})



app.listen(PORT, () => {
  console.log(`wikimapapp listening on port ${PORT}`);
});
