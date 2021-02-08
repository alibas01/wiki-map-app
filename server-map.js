const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const database = require('./database');
const locations = database.getAllLocations();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use('/public', express.static('public'));

const db = {
  "userRandomID" : {id: "userRandomID", coords: {lat:42.3601, lng:-71.0589},
    title: 'restaurant', category: 'restaurant', description: 'restaurant'},
  "userRandomID2": {id: "userRandomID2", coords:{lat:42.8584, lng:-70.9300},
    title: 'shopping mall', category: 'shopping mall', description: 'shopping mall'}
};

app.get('/', (req, res) => {
  res.render('index');
});




