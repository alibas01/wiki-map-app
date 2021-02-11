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
db.connect().then(console.log('database connection established👌'));

// Helper functions
const db_helpers = require('./lib/db_helpers')(db);
const getPassword = db_helpers.getPassword;
const getMapIdbyUserId = db_helpers.getMapIdbyUserId;
const getMapsbyId = db_helpers.getMapsbyId;
const getUsers = db_helpers.getUsers;
const newUser = db_helpers.newUser;
const newPoint = db_helpers.newPoint;
const newMap = db_helpers.newMap;
const newLike = db_helpers.newLike;
const getAllLocations = db_helpers.getAllLocations;
const findUserIdByName = db_helpers.findUserIdByName;
const isRegisteredBefore = db_helpers.isRegisteredBefore;

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
const profileRoute = require("./routes/profile");


// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
app.use("/login", loginRoute(db));
app.use("/logout", logoutRoute(db));
app.use("/register", registerRoute(db));
app.use("/profile", profileRoute(db));

// Note: mount other resources here, using the same pattern above


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).



app.use('/public', express.static('public'));

app.get("/", (req, res) => {
  const user = req.session['user_id']; // this should be on all get routes
  let map_id = 3;
  getAllLocations(map_id).then(rows => {
    const locations = rows;
    const templateVars = { user, locations };
    res.render('index', templateVars);
  })
  .catch(err => res.status(500).send(err.stack));
});

app.get('/points', (req, res) => {
  const user = req.session['user_id']; // this should be on all get routes
  let map_id = 2;
  getAllLocations(map_id).then(rows => {
    const locations = rows;
    const templateVars = { user:user, greeting: 'welcome',locations: locations };
    res.render('points', templateVars);
  })
  .catch(err => res.status(500).send(err.stack));
});

app.get('/new-map', (req, res) => {
  const user = req.session['user_id']; // this should be on all get routes
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
app.get('/detail/:id', (req, res) => {
  const user = req.session['user_id']; // this should be on all get routes
  locations.then(result => {
    const locations = result;
    let templateVars;
    for (const map of locations) {
      console.log(map['id'], req.params.id);
      if (map['id'] === Number(req.params.id)) {
        templateVars = {
          lat: map['lat'],
          long: map['long'],
          title: map['name'],
          description: map['description'],
        };
      }
    }
    res.render('detail', templateVars);
  });
});






app.listen(PORT, () => {
  console.log(`wikimapapp listening on port ${PORT}`);
  });


