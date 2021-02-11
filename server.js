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

app.post('/points', (req, res) => {
  console.log('/points post', req.body);
  findUserIdByName(req.session['user_id']).then(userID => {

    const newPointObj = {
      name: req.body.name,
      map_id: Number(req.body.map_id),
      lat: req.body.lat,
      long: req.body.long,
      user_id: Number(userID),

      // picture_url:
      description: req.body.description,
      website: 'www.google.com',

    };

    newPoint(newPointObj)
      .then(point => {
        console.log(point);
        getAllLocations(Number(req.body.map_id))
          .then(allPoints => {
            console.log('all points for this map in server:', allPoints);
            res.send(allPoints);
          })
          .catch(err => {
            console.log('There was an error fetching all points:', err);
          });
        console.log('created new point...');
      });
  });

});

app.get('/edit', (req, res) => {
  if (!req.session['user_id']) {

    let error_message = `Please Register or Sign In to Edit Maps!`;
    let code = 403;
    const user = null;

    const templateVars = { user, error_message, code};
    res.render("error", templateVars);
  } else {
    //get and pass map id to
    // getAllMaps(req.session['user_id']).then(userID => {
    //   getMapIdbyUserId(userID).then(mapID => {
    //     console.log('mapID', mapID);
    //     // res.render('wow');
    //     // res.status(200).send(mapID);
    //     res.send({mapID});
    //   })
    //   .catch(err => {
    //     console.log('there was an error:', err);
    //   });
    // });

    const user = req.session['user_id']; // this should be on all get routes
    const templateVars = { user:user };
    res.render('edit', templateVars);
  }
});


app.get('/new', (req, res) => {
  if (!req.session['user_id']) {

    let error_message = `Please Register or Sign In to Create Maps!`;
    let code = 403;
    const user = null;

    const templateVars = { user, error_message, code};
    res.render("error", templateVars);
  } else {
    const user = req.session['user_id']; // this should be on all get routes
    const templateVars = { user:user };
    res.render('new', templateVars);
  }
});

app.post('/new', (req, res) => {
  findUserIdByName(req.session['user_id']).then(userID => {
    const newMapObj = {
      user_id: userID,
      title: req.body.title,
      city: req.body.city,
      isPublic: req.body.visibility
    };
    newMap(newMapObj);
    console.log(newMapObj);
    getMapIdbyUserId(userID)
      .then(mapID => {
        console.log('mapID', mapID);
        // res.render('wow');
        // res.status(200).send(mapID);
        res.send({mapID});
      })
      .catch(err => {
        console.log('there was an error:', err);
      });
  });
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


