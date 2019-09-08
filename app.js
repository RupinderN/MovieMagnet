// ==============
// REQUIRE ROUTES
// ==============
const express = require('express'),
	  app = express(),
	  request = require("request"),
	  mongoose = require('mongoose'),
	  bodyParser = require('body-parser'),
	  imdb = require('imdb-api');
	  // imdb = require('imdb');
	  // rp = require('request-promise');


// ==============
// CONFIGURATION
// ==============
// mongoose.connect("mongodb://localhost:27017/movie_app", { useNewUrlParser: true });
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", function(req, res){
    var url = "https://api.themoviedb.org/3/discover/movie?api_key=57198b2c3e654b257b7cf99d000169d9&sort_by=revenue.desc&primary_release_date.gte=2015-01-01";
    request(url, function(error, response, body){
        if(!error && response.statusCode == 200) {
            var data = JSON.parse(body)
            res.render("home", {data: data});
        }
    });
});

// var url_s = 'http://www.omdbapi.com/?apikey=thewdb&t=';
// var url_e = '&y=2019';
var url = "https://api.themoviedb.org/3/movie/now_playing?api_key=57198b2c3e654b257b7cf99d000169d9&language=en-US&page=1";


app.get("/main", function(req, res){
	var url = "https://api.themoviedb.org/3/movie/now_playing?api_key=57198b2c3e654b257b7cf99d000169d9&language=en-US&page=1";
	request(url, function(error, response, body){
		var data = JSON.parse(body);
		
		res.render('main', {data: data});
	});
});

app.get('/login', function(req, res){
	res.render('login');
});

app.get('/register', function(req, res){
	res.render('register');
});

app.post('/more', function(req, res) {
	var newMovie = req.body.movie;
	res.render("show", {movie: newMovie});
});

// ==============
// SERVER STARTUP
// ==============
app.listen(3000, () => { console.log('Server has started!') });