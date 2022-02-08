var express = require('express');
const path = require('path');
const hbs = require('hbs');
var mysql = require('mysql');
require('dotenv').config();
var dateToWords = require("date-to-words");
const { all } = require('express/lib/application');
var con = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database:process.env.MYSQL_DATABASE
});

con.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully !');
});


var app = express();


const PORT = process.env.PORT;

app.set('view engine', 'hbs')
// app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static('public')); 
const db = require("./models");
const initRoutes = require("./routes/tutorial.routes");
const async = require('hbs/lib/async');

global.__basedir = __dirname + "/.";

app.use(express.urlencoded({ extended: true }));
initRoutes(app);

db.sequelize.sync();


app.get('/', (req, res)=>{          
res.render('uploader');
});

app.get('/home', (req, res)=>{  
    con.query('SELECT `names` FROM `courses` WHERE 1',
    function(err, rows, fields) {
    if (err) throw err;
    var courses = [];
    //console.log('The solution is: ', rows.length);
    for (var i =0; i < rows.length; i++) {
      //console.log('The solution is: ', rows[i]["id"]);
      courses.push(rows[i]["names"]);
    }
    console.log(courses);
    res.render('home',{courses:courses});
    });        
});

// let serial;
// app.get('/find_serial',(req, res)=>{
//     con.query('SELECT serial_no FROM counter',
//     function(err, rows, fields) {
//     if (err) throw err;
//     serial = rows[0].serial_no;
//     console.log(serial, 'find_serial');
//     });
// })
app.get('/edit_course', (req, res)=>{
    con.query('SELECT `names` FROM `courses` WHERE 1',
    function(err, rows, fields) {
    if (err) throw err;
    var courses = [];
    //console.log('The solution is: ', rows.length);
    for (var i =0; i < rows.length; i++) {
      //console.log('The solution is: ', rows[i]["id"]);
      courses.push(rows[i]["names"]);
    }
    console.log(courses);
    res.render('edit_course',{courses:courses});
    });
})

app.post('/add_course',(req, res)=>{
    con.query('INSERT INTO `courses`(`names`) VALUES (?)', [req.body.course],
    function(err, rows, fields){
        if(err) throw err;
        res.send("successfully added course");
    });
});

app.post('/delete_course',(req, res)=>{
    console.log(req.body.course, "lolsss");
    var sql = "DELETE FROM `courses` WHERE names = ?";
    con.query(sql,[req.body.course], function (err, result) {
        if (err) throw err;
        console.log("Number of records deleted: " + result.affectedRows);
        res.send("successfully delete course");
    });
});


app.get('/search', function(req, res) {
    con.query('SELECT * FROM tutorials WHERE GR_NO LIKE "%' + req.query.term + '%"',
    function(err, rows, fields) {
    if (err) throw err;
    all_data = rows;
    var data = [];
    for (i = 0; i < rows.length; i++) {
    data.push(rows[i].GR_NO);
    }
    res.end(JSON.stringify(data));
    });
});

app.get('/all_data', (req, res)=>{
    con.query('SELECT tutorials.*, printed_lcs.DOL, printed_lcs.course, printed_lcs.year, printed_lcs.fromm, printed_lcs.too, printed_lcs.cgpi, printed_lcs.serial_no from tutorials LEFT JOIN printed_lcs on tutorials.id = printed_lcs.id WHERE tutorials.GR_NO = ?', [req.query.GR_NO],
    function(err, rows, fields) {
    if (err) throw err;
    res.send(rows);
    });
});


function swap(dates){
    let trail = dates;
    let mmdd = trail.split('/');
    let c = mmdd[0];
    mmdd[0] = mmdd[1];
    mmdd[1] = c;
    console.log(mmdd.join('/'));
    return mmdd.join('/'); 
}

function findser(){
    console.log("func invoked");
    return new Promise((resolve, reject) => {
    con.query('SELECT serial_no FROM counter', (err, rows, fields) => {
    if (err) {
        return reject(err);
    }
    resolve(rows);
    });
 });
}

app.post('/LC', async (req, res)=>{
    const datas = req.body;
    console.log(!datas.serial_no, "chekerrr");
    if(!datas.serial_no){
        try{
            let rows =  await findser();
            datas.serial_no = rows[0].serial_no;
            console.log(rows[0].serial_no);           
        }catch(err){
            console.log(err);
        }
    }
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
    datas.cancel = false;
    if(req.body.Cancelled){
        datas.cancel = true;
    }
    console.log(datas, "final");
    res.render('LC', datas);
});

function isprinted(ser){
    console.log("func invoked2");
    return new Promise((resolve, reject) => {
    con.query('SELECT * from printed_lcs WHERE serial_no = ?', [ser], (err, rows, fields) => {
    if (err) {
        return reject(err);
    }
    resolve(rows);
    });
 });
}

app.post('/update_serial', async (req, res)=>{
    try{
        let row =  await isprinted(req.body.serial_no);
        console.log(!row[0], "rrrr");
        if(!row[0]){
            con.query('SELECT serial_no FROM counter WHERE id = 1',
                function(err, rowss, fields) {
                if (err) throw err;
                let serial = rowss[0].serial_no;
                let to = (req.body.too).slice(5);
                let sql2 = "INSERT INTO `printed_lcs`(`id`, `GR_NO`, `Candidate_Name`, `Date_of_issue`, `DOL`, `course`, `year`, `fromm`, `too`, `cgpi`, `serial_no`, `remark`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
                con.query(sql2,[req.body.id,req.body.GR_NO,req.body.name,req.body.t_date,req.body.DOL,req.body.course,req.body.year,req.body.fromm,to,req.body.CGPI,serial,req.body.remark], function (err, result) {
                    if (err) throw err;
                    console.log(result.affectedRows + " record(s) updated");
                });
                serial++;
                let sql = "UPDATE counter SET serial_no = ? WHERE id = 1";
                con.query(sql,[serial], function (err, result1) {
                if (err) throw err;
                console.log(result1.affectedRows + " record(s) updated");
                });
            });
        }           
    }catch(err){
        console.log(err);
    }
    res.redirect('/');
});




app.listen(PORT, console.log(
    `Server started on port ${PORT}`));