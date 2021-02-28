'use strict';

// importing packages
const express = require('express');
const cors = require('cors');

// configration
const app = express();
app.use(cors());
require('dotenv').config();

// PORT
const PORT = process.env.PORT;


// view and statics
app.set('view engine', 'ejs');
app.use('/public', express.static('./public'));


// handler funcitons

const handleHello = (req, res) => {
    res.render('pages/index')
}
function handleSearch(req, res){
res.render('pages/searches/new')
}

// roots / Paths
app.get('/hello', handleHello);
app.get('/searches/new', handleSearch)



app.listen(PORT, () => {
    console.log('the app is listening on port: ' + PORT)
});