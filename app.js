// ========
// REQUIRE 
// ========
const express = require('express'),
	  app = express(),
	  request = require("request"),
	  mongoose = require('mongoose'),
	  User = require('./models/user'),
	  bodyParser = require('body-parser'),
	  passport = require('passport'),
	  LocalStrategy = require('passport-local'),
	  passportLocalMongoose = require('passport-local-mongoose');


// ======================
// GENERAL CONFIGURATION
// ======================


mongoose.connect("mongodb://localhost:27017/movie_app", { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));


// =======================
// PASSPORT CONFIGURATION
// =======================


app.use(require("express-session")({
    secret: "I am a godly programmer",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
})

// =======
// ROUTES
// =======


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
	var url = "https://api.themoviedb.org/3/movie/now_playing?api_key=57198b2c3e654b257b7cf99d000169d9&language=en-US&page=1";
	request(url, function(error, response, body){
		var data = JSON.parse(body);
		
		res.render('main', {data: data});
	});
});

app.post('/more', function(req, res) {
	var newMovie = req.body.movie;
	res.render("show", {movie: newMovie});
});


// ======================
// AUTHENTICATION ROUTES
// ======================


app.get('/login', function(req, res){
	res.render('login');
});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/main",
        failureRedirect: "/login"
    }), function(req, res){
});

app.get('/register', function(req, res){
	res.render('register');
});

app.post('/register', function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
			console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/main"); 
        });
	});
});

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/main');
})


// ==============
// SERVER STARTUP
// ==============

app.listen(3000, () => { console.log('Server has started!') });

