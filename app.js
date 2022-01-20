var express = require('express');
const path = require('path')
const hbs = require('hbs')
var mysql = require('mysql');
require('dotenv').config();
var dateToWords = require("date-to-words");
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

let serial;

app.get('/all_data', (req, res)=>{ 
    con.query('SELECT students_details.*,counter.serial_no FROM students_details,counter WHERE GR_NO = ?', [req.query.GR_NO],
    function(err, rows, fields) {
    if (err) throw err;
    serial = rows[0].serial_no;
    res.send(rows);
    });
});

function swap(dates){
    let trail = dates;
    let mmdd = trail.split('/');
    let c = mmdd[0];
    mmdd[0] = mmdd[1];
    mmdd[1] = c;
    return mmdd.join('/'); 
}
  

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
    let final = leave.reverse().join(" - ");
    let final1 = study.reverse().join(" - ");
    let final2 = till.reverse().join(" - ");
    datas.newleave = final;
    datas.newstudy = final1;
    datas.newtill = final2;

    let today = new Date().toLocaleDateString().slice(0, 10);
    datas.todaydate = swap(today);

    datas.newdob = swap(req.body.dob);
    datas.newdoa = swap(req.body.doa);
    
    let towords = dateToWords(new Date(req.body.dob));
    let spitter = towords.split(" ");
    let b = spitter[0];
    spitter[0] = spitter[2];
    spitter[2] = b;

    datas.toword = spitter.join(" ").replace(',', '').replace("the", "of");

    datas.serial_no = serial;
    console.log(datas, "final");
    res.render('LC', datas);
});

app.get('/update_serial', (req, res)=>{
    con.query('SELECT serial_no FROM counter WHERE id = 1',
    function(err, rows, fields) {
    if (err) throw err;
    let serial = rows[0].serial_no;
    serial++;
    var sql = "UPDATE counter SET serial_no = ? WHERE id = 1";
    con.query(sql,[serial], function (err, result) {
      if (err) throw err;
      console.log(result.affectedRows + " record(s) updated");
    });
    });
    res.redirect('/');
});

app.listen(PORT, console.log(
    `Server started on port ${PORT}`));