
// ========
// REQUIRE 
// ========


const express = require('express'),
	  app = express(),
	  request = require("request"),
	  mongoose = require('mongoose'),
	  flash = require('connect-flash'),
	  imdb = require('imdb'),
	  nodemailer = require('nodemailer'),
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
app.use(bodyParser.json());
app.use(flash());


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
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


// ====================
// MOVIE FUNCTIONALITY
// ====================



async function get_ids() {
    
    var movieArray = [];

    for (var i = 1; i <= 2; i++) {
        movieArray.push(new Promise((resolve, reject) => {
            var url = "https://api.themoviedb.org/3/movie/now_playing?api_key=57198b2c3e654b257b7cf99d000169d9&language=en-US&page=";

            request(url + i.toString(), function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    var data = JSON.parse(body);
                    var ids = [];

                    data['results'].forEach(movies => {
                        ids.push(movies.id);
                    });
                    resolve(ids);
                    // console.log(data);
                } else {
                    console.log(err);
                }
            });
        }));
    };

    await Promise.all(movieArray);
    return Promise.all(movieArray);
}


async function insert_ids(ids) {

    var movie_ids = ids[0].concat(ids[1]);
    var promiseArray = [];
    console.log(movie_ids);
    
    for(var i = 0; i < movie_ids.length - 10; i++) {
        promiseArray.push(new Promise((resolve, reject) => {
            var url1 = "https://api.themoviedb.org/3/movie/";
            var url2 = "/external_ids?api_key=57198b2c3e654b257b7cf99d000169d9";

            request(url1 + movie_ids[i] + url2, function (err, res, body) {
                    if (!err && res.statusCode == 200) {
                        var data = JSON.parse(body);
                        resolve(data.imdb_id);
                        // console.log(data.imdb_id);
                    } else {
                        console.log(err);
                    }
                });
        }));
    };

    await Promise.all(promiseArray)
    return Promise.all(promiseArray);
}




async function final(final_ids) {

    var promiseArray = [];
    
    for (var i = 0; i < final_ids.length; i++) {
        promiseArray.push(new Promise((resolve, reject) => {
			imdb(final_ids[i], function (err, data) {
				if(err) {
					console.log(err.stack);
				}
				if(data) {
					resolve(data.rating);
				}
			});
        }));
    };

    await Promise.all(promiseArray);
    return Promise.all(promiseArray);
}


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
	
	async function ratings() {
	
	var obj = {};
    let movie_ids = await get_ids();
    let imdb_pages = await insert_ids(movie_ids);
    final_ratings = await final(imdb_pages);
	obj = {"ratings": final_ratings};
    
	
	
	var url = "https://api.themoviedb.org/3/movie/now_playing?api_key=57198b2c3e654b257b7cf99d000169d9&language=en-US&page=1";
	var url2 = "https://api.themoviedb.org/3/movie/now_playing?api_key=57198b2c3e654b257b7cf99d000169d9&language=en-US&page=2";
	
	request(url, function(error, response, body){
		var data = JSON.parse(body);
		
		request(url2, function(error, response, body){
			var data2 = JSON.parse(body);

			res.render('main', {data: data, data2: data2, obj: obj});
		});
	});
	}
	
	ratings();
	
});



app.post("/main", function(req, res){
		
	User.updateOne({username: req.user.username}, {
		rating: req.body.rating,
		getEmails: req.body.getEmails
	}, function(err, user) {
			if(err) {
				console.log(err);
			} 
		});
	
	res.redirect('/main');
	
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
			req.flash("error", err.message);
            res.render("register");
        } else {
			passport.authenticate("local")(req, res, function(){
				
					User.updateOne({username: req.user.username}, {
						rating: 0,
					}, function(err, user) {
							if(err) {
								console.log(err);
							} 
						});
				
				req.flash("success", "Welcome to Movie Magnet!");
				res.redirect("/main"); 
			});
		}
	});
});

app.get('/logout', function(req, res){
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect('/main');
});


// ===========
// NODEMAILER
// ===========


function mail() {
	let transport = nodemailer.createTransport({
		host: 'smtp.mailtrap.io',
		port: 2525,
		auth: {
		   user: '663587abd546dd',
		   pass: 'eb1c1f1a7df79e'
		}
	});

	const message = {
		from: 'moviemagnet@gmail.com', // Sender address
		to: 'to@email.com',         // List of recipients
		subject: 'Movie Magnet: A movie of your criteria is/has approached theatres!', // Subject line
		text: 'Django Unchained has a rating of 8.4! Start planning your trip to the theatres!' // Plain text body
	};

	transport.sendMail(message, function(err, info) {
		if (err) {
		  console.log(err)
		} else {
		  console.log(info);
		}
	});
}

// ==============
// SERVER STARTUP
// ==============


app.listen(3000, () => { console.log('Server has started!') });


