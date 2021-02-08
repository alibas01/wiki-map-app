const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const database = require('./database');
const locations = database.getAllLocations();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  locations.then(result => {
    const locations_db = result;
    const templateVars = {
      locations: locations_db,
    };
    res.render('home', templateVars);
  });
});

app.listen(port, () => {
  console.log('Server running!')
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
        }
      }
    }
    res.render('detail', templateVars);
  })

});
