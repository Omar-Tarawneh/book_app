'use strict';

// importing packages
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
// configration
const app = express();
app.use(cors());
require('dotenv').config();
const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
// PORT
const PORT = process.env.PORT;


// view and statics
app.set('view engine', 'ejs');
app.use('/public', express.static('./public'));
app.use(express.urlencoded({ extended: true }));


// handler funcitons

// const handleHello = (req, res) => {
//     res.render('pages/index')
// }


const handleHome = (req, res) => {
    getBooksDB().then(data => {
        counter().then(count => {
            res.render('pages/index', { booksArray: data, number: count });
        })
    });
}

function handleForm(req, res) {
    res.render('searches/new')
}

// Get the data from Google API and send the response
function handleSearch(req, res) {
    let search_query = req.body.seachQuery;
    let search_by = req.body.searchBy;
    getBooksData(search_query, search_by, res).then(data => {
        res.render('searches/show', { booksArray: data });
    }).catch(error => {
        res.render('pages/error', { errorObj: error });
    });
}
// handle the details page
const handleDetails = (req, res) => {

    let query = 'SELECT * FROM list WHERE id = $1';
    let secureValue = [req.params.id];
    client.query(query, secureValue).then(data => {
        res.render('pages/books/detail', { element: data.rows[0] });
    }).catch(error => {
        console.log('error in render the detail for book from DB', error);
    });
}

// handle the books routs
const handleBooks = (req, res) => {
    let reqBody = req.body;
    let query = 'INSERT INTO list(title, author, img, description) VALUES ($1,$2,$3,$4) RETURNING * ;'
    let secureValue = [reqBody.title, reqBody.author, reqBody.img, reqBody.description];
    client.query(query, secureValue).then((data) => {
        let id = data.rows[0].id;
        res.redirect(`/books/${id}`);
    }).catch(error => {
        console.log('error in inserting the book to the DB', error);
    });
}


// roots / Paths
// app.get('/hello', handleHello);
app.get('/searches/new', handleForm);
app.get('/', handleHome);
app.get('/books/:id', handleDetails);
app.post('/searches', handleSearch);
app.post('/books', handleBooks);

// Functions
// get all the data from the DATA BASE
const getBooksDB = () => {
    let sqlQuery = 'SELECT * FROM list;';
    return client.query(sqlQuery).then(data => {
        return data.rows;
    }).catch(error => {
        console.log('Error from getting data from DB ', error);
    })
}
// count number of books in DB
const counter = () => {
    let query = 'SELECT COUNT(*) FROM list;';
    return client.query(query).then(data => {
        return data.rows[0].count;
    }).catch(error => {
        console.log('Error in couting books in DB ', error);
    })
}


const getBooksData = (search_query, search_by, res) => {
    const url = 'https://www.googleapis.com/books/v1/volumes';
    const query = {
        q: `${search_query}+in${search_by}`
    };
    return superagent.get(url).query(query).then(data => {
        let booksArray = data.body.items.map(book => new Book(book));
        // console.log(booksArray);
        return booksArray;
    }).catch(error => {
        res.render('pages/error', { errorObj: error });
    });
}
// check if the property exist if not add it with a default value
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
    this.img = checkProperty(BookObject.volumeInfo).imageLinks.thumbnail.replace('http:', 'https:') || 'https://i.imgur.com/J5LVHEL.jpg';
}

client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('the app is listening on port: ' + PORT)
    });
}).catch(error => {
    console.log('There is an Error ' + error);
});