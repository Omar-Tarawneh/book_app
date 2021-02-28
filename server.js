'use strict';

// importing packages
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
// configration
const app = express();
app.use(cors());
require('dotenv').config();

// PORT
const PORT = process.env.PORT;


// view and statics
app.set('view engine', 'ejs');
app.use('/public', express.static('./public'));
app.use(express.urlencoded({ extended: true }));


// handler funcitons

const handleHello = (req, res) => {
    res.render('pages/index')
}

function handleForm(req, res) {
    res.render('pages/searches/new')
}

// Get the data from Google API and send the response
function handleSearch(req, res) {
    let search_query = req.body.seachQuery;
    let search_by = req.body.searchBy;
    // console.log(search_query, search_by);
    getBooksData(search_query, search_by, res).then(data => {
        console.log(data);
        res.render('pages/searches/show', { booksArray: data });
    }).catch(error => {
        res.render('pages/error', { errorObj: error });
    });
}

// roots / Paths
app.get('/hello', handleHello);
app.get('/searches/new', handleForm);
app.post('/searches', handleSearch);

// Functions
const getBooksData = (search_query, search_by, res) => {
    const url = 'https://www.googleapis.com/books/v1/volumes';
    const query = {
        q: `${search_query}+in${search_by}`
    };
    // console.log(query.q);
    return superagent.get(url).query(query).then(data => {
        // console.log(data.body.items);
        let booksArray = data.body.items.map(book => new Book(book));
        console.log(booksArray);
        return booksArray;
    }).catch(error => {
        res.render('pages/error', { errorObj: error });
    });
}

const checkProperty = (property) => {
    if (property.hasOwnProperty('imageLinks')) {
        return property;
    } else {
        property.imageLinks = { thumbnail: 'https://i.imgur.com/J5LVHEL.jpg' };
        return property;
    }
}

// Constructor 
function Book(BookObject) {
    this.title = BookObject.volumeInfo.title || 'NA';
    this.author = BookObject.volumeInfo.authors || 'NA';
    this.description = BookObject.volumeInfo.description || 'There is no Descripttion for this Book';
    this.img = checkProperty(BookObject.volumeInfo).imageLinks.thumbnail.replace('http', 'https') || 'https://i.imgur.com/J5LVHEL.jpg';
}

app.listen(PORT, () => {
    console.log('the app is listening on port: ' + PORT)
});