const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

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
  }
  res.render('home', templateVars);
});

app.listen(port, () => {
  console.log('Server running!')
});

app.get('/new-map', (req, res) => {
  res.render('new');
});

app.post('/new-map', (req, res) => {
  const key = generateRandomString();
  const currentPosition = JSON.parse(req.body.position)
  db[key] = {
    id: key,
    coords: currentPosition,
    title: req.body.title,
    category: req.body.category,
    description: req.body.description
  };
  res.redirect(`/detail/${key}`);
});

app.get('/detail/:id', (req, res) => {
  const map = db[req.params.id];
  const templateVars = {
    position: map['coords'],
    title: map['title'],
    description: map['description'],
    category: map['category']
  }
  res.render('detail', templateVars);
});
