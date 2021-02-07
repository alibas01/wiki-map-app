const express = require('express');
const app = express();
const port = 8080;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('new');
});

app.listen(port, () => {
  console.log('Server running!')
});

app.get('/new-map', (req, res) => {
  res.render('new');
});

app.get('/detail', (req, res) => {
  res.render('detail');
});
