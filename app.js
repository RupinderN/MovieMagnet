// ==============
// REQUIRE ROUTES
// ==============
const express = require('express'),
	  app = express(),
	  request = require("request"),
	  mongoose = require('mongoose'),
	  bodyParser = require('body-parser'),
	  imdb = require('imdb');

// ==============
// CONFIGURATION
// ==============
mongoose.connect("mongodb://localhost:27017/movie_app", { useNewUrlParser: true });
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));

var movieSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    release: String
});

var Movie = mongoose.model("Movie", movieSchema);


imdb('tt6105098', function(err, data) {
  if(err)
    console.log(err.stack);
 
  if(data)
    console.log(data);
});

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
    var url = "https://api.themoviedb.org/3/discover/movie?api_key=57198b2c3e654b257b7cf99d000169d9&sort_by=revenue.desc&primary_release_date.gte=2015-01-01";
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