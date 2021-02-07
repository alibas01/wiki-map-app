const express = require('express');
const app = express();
const port = 8080;
const initMap = require('./helper');

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('main');
});

app.listen(port, () => {
  console.log('Server running!')
});

