// ==============
// REQUIRE ROUTES
// ==============
const express = require('express'),
	  app = express(),
	  request = require("request"),
	  mongoose = require('mongoose');

// =============
// CONFIGURATION
// =============
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));

// OBTAIN TODAY'S DATE FORMAT FOR API
var today = new Date();
var ddt = String(today.getDate()).padStart(2, '0');
var mmt = String(today.getMonth() + 1).padStart(2, '0'); 
var yyyyt = today.getFullYear();
today = yyyyt + '-' + mmt + '-' + ddt;

// OBTAIN PAST DATE (2 MONTHS PREVIOUS) FORMAT FOR API
var past = new Date();
var dd = String(past.getDate()).padStart(2, '0');
var mm = String(past.getMonth() - 1).padStart(2, '0');
var yyyy = past.getFullYear();
past = yyyy + '-' + mm + '-' + dd;

app.get("/", function(req, res){
    var url = "https://api.themoviedb.org/3/discover/movie?api_key=57198b2c3e654b257b7cf99d000169d9&primary_release_date.gte=" + past + "&primary_release_date.lte=" + today;
    request(url, function(error, response, body){
        if(!error && response.statusCode == 200) {
            var data = JSON.parse(body)
            res.render("home", {data: data});
        }
    });
});

app.get("/main", function(req, res){
    var url = "https://api.themoviedb.org/3/discover/movie?api_key=57198b2c3e654b257b7cf99d000169d9&primary_release_date.gte=" + past + "&primary_release_date.lte=" + today;
    request(url, function(error, response, body){
        if(!error && response.statusCode == 200) {
            var data = JSON.parse(body)
            res.render("main", {data: data});
        }
    });
});

// app.get('/main/:id', function(req, res){
// 	var 
// });

app.get('/login', function(req, res){
	res.render('login');
});

app.get('/register', function(req, res){
	res.render('register');
});


// ==============
// SERVER STARTUP
// ==============
app.listen(3000, () => { console.log('Server has started!') });