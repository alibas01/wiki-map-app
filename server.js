/* eslint-disable camelcase */
// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const salt       = 10;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');


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
const getFavouritesById = db_helpers.getFavouritesById;
const search = db_helpers.search;
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

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above

app.use('/public', express.static('public'));

app.get("/", (req, res) => {
  getAllMaps().then(rows => {
    const templateVars = { maps: rows };
    res.render('index', templateVars);
  })
  .catch(err => res.status(500).send(err.stack));
});

app.get('/points', (req, res) => {
  let map_id = 4;
  getAllLocations(map_id).then(rows => {
    const locations = rows;
    const templateVars = { greeting: 'welcome',locations: locations, map_id };
    res.render('points', templateVars);
  })
  .catch(err => res.status(500).send(err.stack));
});

app.get('/new-map', (req, res) => {
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
    const locations = result;
    const id_current = req.params.location_id;
    const templateVars = {
      locations,
      id_current,
    };
    res.render('detail', templateVars);
  });
});

app.get('/search', (req, res) => {
  res.render('search');
})

app.post('/search', (req, res) => {
  const city = req.body.city;
  const description = req.body.description;
  search(city, description).then(result => {
    // console.log(result);
    const templateVars = { greeting: 'welcome', locations: result };
    res.render('results', templateVars);
  })
})

app.get('/favorites', (req, res) => {
  let user_id = 1;
  getFavouritesById(user_id).then(results => {
    console.log(results);
    const templateVars = {
      favourites: results
    }
    res.render('favorites', templateVars);
  })
})

app.get('/profile', (req, res) => {
  //get current user profile
  res.render('profile');
});


// GET /register
// app.get("/register", (req, res) => {
//   const user = users[req.session['user_id']];
//   const templateVars = { user };
//   if (!user) {
//     res.render("register", templateVars);
//   } else {
//     res.redirect(`/`);
//   }
// });

// POST /register
// app.post("/register", (req, res) => {
//   let email = req.body.email;
//   let password = bcrypt.hashSync(req.body.password, salt);
//   if (email !== "" && req.body.password !== "") {
//     if (!isRegisteredBefore(users, email)) {
//       let id = generateRandomString();
//       let newUser = {id, email, password};
//       users[id] = newUser;
//       req.session['user_id'] = id;
//       res.redirect("/urls");
//     } else {
//       res.status(400);
//       res.send(`<html><body><h1>Error:400</h1> <h2><b>This email(${email}) registered before!!!</h2><h3><a href="/register">Register</a></h3></b></body></html>\n`);
//     }
//   } else {
//     res.status(400);
//     res.send('<html><body><h1>Error:400</h1> <h2><b>Email or Password cannot be empty!!!</h2><h3><a href="/register">Register</a></h3></b></body></html>\n');
//   }
// });


// GET /login
// app.get("/login", (req, res) => {
//   const user = users[req.session['user_id']];
//   const templateVars = { user: user };
//   if (!user) {
//     res.render("login", templateVars);
//   } else {
//     res.redirect(`/`);
//   }
// });

// POST /login
// app.post("/login", (req, res) => {
//   let email = req.body.email;
//   let password = req.body.password;
//   if (isRegisteredBefore(users, email)) {
//     if (isPasswordMatch(users, email, password)) {
//       req.session['user_id'] = findId(users, email);
//       res.redirect(`/urls`);
//     } else {
//       res.status(403);
//       res.send(`<html><body><h1>Error:403</h1> <h2><b>Please check your password!!!</h2><h3><a href="/login">Login</a></h3></b></body></html>\n`);
//     }
//   } else {
//     res.status(403);
//     res.send(`<html><body><h1>Error:403</h1> <h2><b>This email(${email}) is not registered!!!\n Please Register first!</h2><h3><a href="/register">Register</a></h3></b></body></html>\n`);
//   }
// });

// GET /logout
// app.get("/logout", (req, res) => {
//   req.session['user_id'] = null;
//   res.redirect(`/`);
// });


app.listen(PORT, () => {
  console.log(`wikimapapp listening on port ${PORT}`);
  });

