'use strict';


const express = require('express');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT || 4000;
app.use(express.urlencoded());
app.set('view engine', 'ejs');

app.get('/', renderHomePage);
app.get('/searches/new', showForm);
app.post('/searches', createSearch);

app.get('*', (request, response) => response.status(404).send('This route does not exist'));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title || 'No title available';
   this.authors=info.authors;
   this.description=info.description;
}
function renderHomePage(request, response) {
  response.render('pages/index');
}
function showForm(request, response) {
  response.render('pages/searches/new.ejs');
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