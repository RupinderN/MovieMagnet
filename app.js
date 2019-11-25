
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

// ENVIRONMENT VARIABLE CONFIGURATION

	require('dotenv').config();


// ======================
// GENERAL CONFIGURATION
// ======================

var url = process.env.DATABASEURL || "mongodb://localhost:27017/movie_app";

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

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
    secret: "Just Vibin",
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
			if(final_ids[i] !== null) {
				imdb(final_ids[i], function (err, data) {
					if(err) {
						console.log(err.stack);
					}
					if(data) {
						resolve(data.rating);
					}
				});
			} else {
				resolve(0);
			}
        }));
    };

    await Promise.all(promiseArray);
    return Promise.all(promiseArray);
}


async function mailingList() {

	var obj = {};
	let movie_ids = await get_ids();
	let imdb_pages = await insert_ids(movie_ids);
	final_ratings = await final(imdb_pages);
	obj = {"ratings": final_ratings};


	var url = "https://api.themoviedb.org/3/movie/now_playing?api_key=57198b2c3e654b257b7cf99d000169d9&language=en-US&page=1";
	var url2 = "https://api.themoviedb.org/3/movie/now_playing?api_key=57198b2c3e654b257b7cf99d000169d9&language=en-US&page=2";

	request(url, function(error, response, body){
		var data = JSON.parse(body);



			  User.find({}, function(err, Users){
				if (err)
					return done(err);

				if (Users) {
					for (var i = 0; i < Users.length; i++) {
						var emailList = [];
						if(Users[i].getEmails == 'true') {
							for (var j = 0; j < obj.ratings.length; j++) {
								if (obj.ratings[j] >= Users[i].rating) {
									if (j < 20 && !(Users[i].movies[0].includes(data.results[j].title))) {
										emailList.push(data.results[j].title);
									} 
								}
							}
							
							console.log(Users[i].movies[0]);
							console.log(emailList);
							if(emailList && emailList.length) {
								mail(Users[i], emailList);
							}
							
							Users[i].movies.concat(emailList);
							var set = new Set(Users[i].movies);
							Users[i].movies = [...set];
							Users[i].save();
							
							
						}
					}
				}
				  
				
			  });
	});
}

mailingList();


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


async function mail(currentUser, emailList) {
	
	var body = "Here are the movies you might be interested in watching, all above a rating of " + currentUser.rating + ": ";
	emailList.forEach(function(movie) {
		body += movie + ", ";
	});
	
	body = body.substring(0, body.length - 2);
	
	body += ". Please view the site to stop receiving emails about these movies!";
		
	var transport = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
		   user: 'moviemagnetemail@gmail.com',
		   pass: process.env.PASSWORD
			},
		pool: true, // use pooled connection
		rateLimit: true, // enable to make sure we are limiting
		maxConnections: 1, // set limit to 1 connection only
		maxMessages: 10 // send 2 emails per 10 seconds
	});

	const message = {
	from: 'moviemagnet@gmail.com', // Sender address
	to: currentUser.username,         // List of recipients
	subject: 'Movie Magnet: Movies of your criteria are approaching, or have already approached theatres!', // Subject line
	text: body // Plain text body
	};

	transport.sendMail(message, function(err, info) {
		if (err) {
		  console.log(err);
		} else {
		  console.log(info);
		}
	 });
	
}



// ==============
// SERVER STARTUP
// ==============


var port = process.env.PORT || 3000;
var ip = process.env.IP || "127.0.0.1"
app.listen(port, (req, res) => {
	console.log("Server has started at port" + port + " ip: " + ip);
});

