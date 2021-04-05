'use strict';



const express = require('express');
const superagent = require('superagent');
require('dotenv').config();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static( "./public"));
const PORT = process.env.PORT || 4000;
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
app.set('view engine', 'ejs');
app.get('/searches/new', showForm);
app.get('/', renderHomePage);

app.post('/searches', createSearch);

client.connect().then(() =>
  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);

app.get('*', (request, response) => response.status(404).send('This route does not exist'));

function Book(info) {
  this.placeholderImage= info.imageLinks?info.imageLinks.thumbnail:'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title || 'No title available';
   this.authors=info.authors;
   this.description=info.description;
}
function renderHomePage(request, response) {
  
  const selectbooks = 'SELECT * FROM books;';
  client.query(selectbooks).then((results => {
    response.render('pages/index', { results: results.rows });
  })); 
}


function showForm(request, response) {
  const {title, auther, isbn, description,image_url } = request.body;
  const sqlQuery = 'INSERT INTO books (title, auther, isbn, description,image_url) VALUES($1, $2, $3,$4,$5);';
  const safeValues = [title, auther, isbn, description,image_url];

  client.query(sqlQuery, safeValues).then(() => {
    response.render('pages/searches/new.ejs');

    // response.redirect('/');
    
    
  })
 
}


function createSearch(request, response) {
  let url = `https://www.googleapis.com/books/v1/volumes`;
  console.log(request.body);
  const searchBy = request.body.searchBy;
  const searchValue = request.body.search;
  const queryObj = {};
  if (searchBy === 'title') {
    queryObj['q'] = `+intitle:${searchValue}`;
  } else if (searchBy === 'author') {
    queryObj['q'] = `+inauthor:${searchValue}`;

  }
  superagent.get(url).query(queryObj).then(apiResponse => {
    return apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo))
  }).then(results => {
    response.render('pages/searches/show', { searchResults: results })
  });
}