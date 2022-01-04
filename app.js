var express = require('express');
const path = require('path')
const hbs = require('hbs')
var app = express();


const PORT = process.env.PORT ||5000;

app.set('view engine', 'hbs')
// app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static('public')); 

app.get('/', (req, res)=>{

var data = {firstname:'Samsher',
    hobbies:['playing football', 'playing chess', 'cycling']}

res.render('home', data);
});

app.get('/LC', (req, res)=>{
    res.render('LC');
});

app.listen(PORT, console.log(
    `Server started on port ${PORT}`));