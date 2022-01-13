var express = require('express');
const path = require('path')
const hbs = require('hbs')
var mysql = require('mysql');
require('dotenv').config();
const { all } = require('express/lib/application');

var con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "lc"
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database:process.env.MYSQL_DATABASE
});

con.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully !');
});

// let all_data = {};

// con.connect(function(err) {
//     if (err) throw err;
//     con.query("SELECT * FROM students_details", function (err, result, fields) {
//         if (err) throw err;
//         all_data = result;
//         console.log(result);
//     });
// });

var app = express();


const PORT = process.env.PORT;

app.set('view engine', 'hbs')
// app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static('public')); 
app.use(express.urlencoded({extended:false}));


app.get('/', (req, res)=>{     
res.render('home');
});

app.get('/search', function(req, res) {
    con.query('SELECT * FROM students_details WHERE GR_NO LIKE "%' + req.query.term + '%"',
    function(err, rows, fields) {
    if (err) throw err;
    all_data = rows;
    var data = [];
    for (i = 0; i < rows.length; i++) {
    data.push(rows[i].GR_NO);
    }
    res.end(JSON.stringify(data));
    });
    // res.render('home', all_data);
});

app.get('/all_data', (req, res)=>{    
    console.log(req.query.GR_NO); 
    con.query('SELECT * FROM students_details WHERE GR_NO = ?', [req.query.GR_NO],
    function(err, rows, fields) {
    if (err) throw err;
    res.send(rows);
    });
    });

app.post('/LC', (req, res)=>{
    // const {reg_num,fname,religion,caste,subcaste, pob,nation,dob,words,institute,doa,progress,conduct,leave,study,till,reason,remarks,CGPI} = req.body;
    const datas = req.body;
    // console.log(reg_num,"1st");
    // console.log(req.body, "datal");
    let leave = req.body.leave.split("-");
    let study = req.body.study.split("-");
    let till = req.body.till.split("-"); 
    var months = ["January", "February", "March", "April", "May", "June", "July", 
    "August", "September", "October", "November", "December"];
    leave[1] = months[leave[1]-1];
    study[1] = months[study[1]-1];
    till[1] = months[till[1]-1];
    let final = leave.reverse().join(" ");
    let final1 = study.reverse().join(" ");
    let final2 = till.reverse().join(" ");

    datas.newleave = final;
    datas.newstudy = final1;
    datas.newtill = final2;
    let today = new Date().toLocaleDateString().slice(0, 10);
    datas.todaydate = today;
    console.log(datas, "final");
    res.render('LC', datas);
});

app.listen(PORT, console.log(
    `Server started on port ${PORT}`));