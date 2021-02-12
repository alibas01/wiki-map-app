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
db.query(`SELECT id FROM users`).then(data => console.log(data.rows));

// Helper functions
const db_helpers = require('./lib/db_helpers')(db);
const getMapIdbyUserId = db_helpers.getMapIdbyUserId;
const newPoint = db_helpers.newPoint;
const newMap = db_helpers.newMap;
const newLike = db_helpers.newLike;
const getAllLocations = db_helpers.getAllLocations;
const findUserIdByName = db_helpers.findUserIdByName;
const getAllMapsByUserName = db_helpers.getAllMapsByUserName;
const getFavouritesByUserName = db_helpers.getFavouritesByUserName;
const search = db_helpers.search;
const getIdByUserName = db_helpers.getIdByUserName;
const deleteFavourites = db_helpers.deleteFavourites;
const getAllLocationsByMapId = db_helpers.getAllLocationsByMapId;
const getAllLocationsByUserName = db_helpers.getAllLocationsByUserName;
const getAllMaps = db_helpers.getAllMaps;

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

app.use('/public', express.static('public'));

app.get("/", (req, res) => {
  const user = req.session['user_id'];
  const templateVars = { user };
  res.render('index', templateVars);
});

app.get("/index_map", (req, res) => {
  const user = req.session['user_id'];
  if (user) {
    getAllMapsByUserName(user).then(rows => {
      let maps = [];
      let unique = [];
      for (const row of rows) {
        console.log(unique, row['id']);
        if (!unique.includes(row['id'])){
          unique.push(row['id']);
          maps.push(row);
        }
      }
      const templateVars = { maps, user };
      res.status(200).json(templateVars);
    }).catch(err => res.status(500).send(err.stack));
  } else {
    getAllMaps().then(rows => {
      const vars = {maps: rows};
      res.status(200).json(vars);
    });
  }
});

app.get('/points', (req, res) => {
  const user = req.session['user_id'];
  getAllLocationsByUserName(user).then(rows => {
    const locations = rows;
    console.log(locations);
    const templateVars = { greeting: 'welcome',locations: locations, user };
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
app.get('/detail/:map_id/:location_id', (req, res) => {
  let map_id = req.params.map_id;
  getAllLocationsByMapId(map_id).then(result => {
    const user = req.session['user_id'];
    const locations = result;
    const id_current = req.params.location_id;
    const templateVars = {
      locations,
      id_current,
      user,
    };
    console.log(templateVars);
    res.render('detail', templateVars);
  });
});


app.get('/search', (req, res) => {
  const user = req.session['user_id'];
  const templateVars = { user };
  res.render('search', templateVars);
});

app.post('/search', (req, res) => {
  const city = req.body.city;
  const description = req.body.description;
  const user = req.session['user_id'];
  search(city, description).then(result => {
    // console.log(result);
    const templateVars = { greeting: 'welcome', locations: result, user };
    res.render('results', templateVars);
  });
});

app.get('/favorites', (req, res) => {
  const user = req.session['user_id'];
  getFavouritesByUserName(user).then(favourites => {
    const templateVars = {
      favourites,
      user
    };
    console.log(templateVars);
    res.render('favorites', templateVars);
  });
});

app.get('/favorites-ajax', (req, res) => {
  const user = req.session['user_id'];
  getFavouritesByUserName(user).then(favs => {
    let favourites = [];
    let unique = [];
    for (const fav of favs) {
      if(!unique.includes(fav['map_id'])){
        unique.push(fav['map_id']);
        favourites.push(fav);
      }
    }
    const templateVars = {
      favourites,
      user
    };
    console.log(templateVars);
    res.status(200).json(templateVars);
  });
});

app.post('/delete-favourites', (req, res) => {
  console.log(req.body.user_id, req.body.map_id);
  const inputObj = { user_id: Number(req.body.user_id), map_id: Number(req.body.map_id) };
  deleteFavourites(inputObj);
  res.redirect('/favorites');
});

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
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`wikimapapp listening on port ${PORT}`);
});
