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
const findUserIdByName = db_helpers.findUserIdByName;
const getPassword = db_helpers.getPassword;
const isRegisteredBefore = db_helpers.isRegisteredBefore;
const getAllMaps = db_helpers.getAllMaps;
const getFavouritesById = db_helpers.getFavouritesById;
const search = db_helpers.search;

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
// const loginRoute = require("./routes/login");
// const logoutRoute = require("./routes/logout");
// const registerRoute = require("./routes/register");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
// app.use("/login", loginRoute(db));
// app.use("/logout", logoutRoute(db));
// app.use("/register", registerRoute(db));

// Note: mount other resources here, using the same pattern above

app.use('/public', express.static('public'));

app.get("/", (req, res) => {
  getAllMaps().then(rows => {
    const user = req.session['user_id'];
    const templateVars = { maps: rows, user };
    res.render('index', templateVars);
  })
  .catch(err => res.status(500).send(err.stack));
});

app.get("/index_map", (req, res) => {
  getAllMaps().then(rows => {
    const user = req.session['user_id'];
    const templateVars = { maps: rows, user };
    res.status(200).json(templateVars);
  })
  .catch(err => res.status(500).send(err.stack));
});

app.get('/points', (req, res) => {
  let map_id = 4;
  getAllLocations(map_id).then(rows => {
    const user = req.session['user_id'];
    const locations = rows;
    const templateVars = { greeting: 'welcome',locations: locations, map_id, user };
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
  getFavouritesById(user).then(results => {
    const templateVars = {
      favourites: {map_id: 1, user_id: 4, map_id: 1, user_id: 4, map_id: 1, user_id: 4,map_id: 1, user_id: 4},
      user
    }
    // res.render('favorites', templateVars);
    res.status(200).json(templateVars);
  })
})

app.get('/profile', (req, res) => {
  //get current user profile
  const user = req.session['user_id']; // this should be on all get routes
  res.render('profile');
});


// GET /register
app.get("/register", (req, res) => {
  const user = req.session['user_id'];
  const templateVars = { user };
  if (!user) {
    res.render("register", templateVars);
  } else {
    res.redirect(`/`);
  }
});

// // POST /register
app.post("/register", (req, res) => {
  let user = req.body.user;
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.pass, salt);
  let isRegistered = true;
  isRegisteredBefore(user).then(data => {
    if(!data){
    isRegistered = false;
    }
    if (user !== "" && req.body.pass !== "") {
      if (!isRegistered) {
        let newU = {username: user, email, password};
        newUser(newU);
        req.session['user_id'] = user;
        res.redirect("/");
      } else {
        res.status(400);
        let error_message = `<h1>Error:400</h1> <h2><b>This user(${user}) registered before!!!</h2><h3><a href="/register">Register</a></h3></b>\n`;
        templateVars ={ error_message }
        res.render("error", templateVars);
      }
    } else {
      res.status(400);
      let error_message = `<h1>Error:400</h1> <h2><b>Email or Password cannot be empty!!!</h2><h3><a href="/register">Register</a></h3></b>\n`;
        templateVars ={ error_message }
        res.render("error", templateVars);
  }})
});


// GET /login
app.get("/login", (req, res) => {
  const user = req.session['user_id'];
  const templateVars = { user: user };
  if (!user) {
    res.render("login", templateVars);
  } else {
    res.redirect(`/`);
  }
});

// POST /login
app.post("/login", (req, res) => {
  let user = req.body.user;
  let password = req.body.pass;
  let isRegistered = false;
  isRegisteredBefore(user).then(data => {
    if(data){
    isRegistered = true;
    }
    if (isRegistered) {
      getPassword(user).then( pass => {
        if (bcrypt.compareSync(password, pass)) {
          let newU = {username: user, password};
          newUser(newU);
          req.session['user_id'] = user;
          res.redirect("/");
        } else {
          res.status(403);
          let error_message = `<h1>Error:403</h1> <h2><b>Please check your password!!!</h2><h3><a href="/login">Login</a></h3></b>\n`;
          templateVars ={ error_message }
          res.render("error", templateVars);
        }})
    } else {
      res.status(403);
      let error_message = `<h1>Error:403</h1> <h2><b>This email(${user}) is not registered!!!\n Please Register first!</h2><h3><a href="/register">Register</a></h3></b>\n`;
        templateVars ={ error_message }
        res.render("error", templateVars);
  }})
});

//GET /logout
app.get("/logout", (req, res) => {
  req.session['user_id'] = null;
  res.redirect(`/`);
});

app.post("/favourite", (req, res) => {
  console.log(req.body.user_name, req.body.map_id);
})

app.listen(PORT, () => {
  console.log(`wikimapapp listening on port ${PORT}`);
  });
