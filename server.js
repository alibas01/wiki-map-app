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
// Helper functions
const db_helpers = require('./lib/db_helpers');
const getMapIdbyUserId = db_helpers.getMapIdbyUserId;
const getMapsbyId = db_helpers.getMapsbyId;
const getUsers = db_helpers.getUsers;
const newUser = db_helpers.newUser;
const newPoint = db_helpers.newPoint;
const newMap = db_helpers.newMap;
const newLike = db_helpers.newLike;
const getAllLocations = db_helpers.getAllLocations;

//temp data
const database = require('./database');
const locations = database.getAllLocations();

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect().then(console.log('connect to db!'));
db.query(`SELECT title FROM maps LIMIT 5;`).then(
  res => console.log(res.rows)
);
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

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const widgetsRoutes = require("./routes/widgets");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  locations.then(result => {
    const locations = result;
    const templateVars = {
      locations,
    };
    console.log(templateVars);
    res.render('index', templateVars);
  });
});

app.use('/public', express.static('public'));

app.listen(PORT, () => {
  console.log(`wikimapapp listening on port ${PORT}`);
  console.log('Server running!');
});

//BELOW HERE SERVER-MAP

const data = {
  "userRandomID" : {id: "userRandomID", coords: {lat:42.3601, lng:-71.0589},
    title: 'restaurant', category: 'restaurant', description: 'restaurant'},
  "userRandomID2": {id: "userRandomID2", coords:{lat:42.8584, lng:-70.9300},
    title: 'shopping mall', category: 'shopping mall', description: 'shopping mall'}
};


app.get('/points', (req, res) => {
  locations.then(result => {
    const locations_db = result;
    const templateVars = {
      greeting: 'welcome',
      locations: locations_db,
    };
    res.render('points', templateVars);
  });
});

app.get('/profile', (req, res) => {
  //get current user profile
  res.render('profile');
});

app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/logout', (req, res) => {
  res.redirect('/');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/new-map', (req, res) => {
  res.render('new');
});

app.post('/new-map', (req, res) => {
  const currentPosition = JSON.parse(req.body.position);
  const newMap = {
    id: data.length,
    lat: currentPosition['lat'],
    long: currentPosition['lng'],
    name: req.body.title,
    description: req.body.description
  };
  res.redirect(`/detail/${key}`);
});

//see specific details
app.get('/detail/:id', (req, res) => {
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

app.get('/new-map', (req, res) => {
  res.render('new');
});

app.post('/new-map', (req, res) => {
  const currentPosition = JSON.parse(req.body.position);
  const newMap = {
    id: db.length,
    lat: currentPosition['lat'],
    long: currentPosition['lng'],
    name: req.body.title,
    description: req.body.description
  };
  res.redirect(`/detail/${key}`);
});

//see specific details
app.get('/detail/:id', (req, res) => {
  locations.then(result => {
    const locations = result;
    let templateVars;
    for (const map of locations) {
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

app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/logout', (req, res) => {
  res.redirect('/');
});

app.get('/register', (req, res) => {
  res.render('register');
});



app.get('/new-map', (req, res) => {
  res.render('new');
});

app.post('/new-map', (req, res) => {
  const currentPosition = JSON.parse(req.body.position);
  const newMap = {
    id: db.length,
    lat: currentPosition['lat'],
    long: currentPosition['lng'],
    name: req.body.title,
    description: req.body.description
  };
  res.redirect(`/detail/${key}`);
});

//see specific details
app.get('/detail/:id', (req, res) => {
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
    console.log(templateVars);
    res.render('detail', templateVars);
  });

});

