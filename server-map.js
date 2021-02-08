const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const database = require('./database');
const locations = database.getAllLocations();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use('/public', express.static('public'));


function generateRandomString() {
  return  Math.random().toString(36).substring(2,8);
}

const db = {
  "userRandomID" : {id: "userRandomID", coords: {lat:42.3601, lng:-71.0589},
    title: 'restaurant', category: 'restaurant', description: 'restaurant'},
  "userRandomID2": {id: "userRandomID2", coords:{lat:42.8584, lng:-70.9300},
    title: 'shopping mall', category: 'shopping mall', description: 'shopping mall'}
};

app.get('/', (req, res) => {
  const templateVars = {
    greeting: 'welcome',
    db: db,
  };
  res.render('index', templateVars);
});

app.get('/points', (req, res) => {
  const templateVars = {
    greeting: 'welcome',
    db: db,
  };
  res.render('points', templateVars);
});

app.get('/profile', (req, res) => {
  const templateVars = {
    greeting: 'welcome',
    db: db,
  };
  res.render('profile', templateVars);
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.listen(port, () => {
  console.log('Server running!');
});

app.get('/new-map', (req, res) => {
  res.render('new');
});

app.post('/new-map', (req, res) => {
  const currentPosition = JSON.parse(req.body.position)
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
