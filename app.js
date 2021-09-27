var express = require('express');
const path = require('path')
const hbs = require('hbs')
var app = express();

const PORT = process.env.PORT ||5000;

app.set('view engine', 'hbs')

app.get('/', (req, res)=>{

    var data = {firstname:'Samsher',
        hobbies:['playing football', 'playing chess', 'cycling']}
    
    res.render('home', data);
    });
    
    app.listen(PORT, console.log(
        `Server started on port ${PORT}`));