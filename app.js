// ==============
// REQUIRE ROUTES
// ==============
const express = require('express'),
	  app = express(),
	  mongoose = require('mongoose');

// =============
// CONFIGURATION
// =============
app.set('view engine', 'ejs');

app.use('/', function(req, res){
	res.render('home');	
});


// ==============
// SERVER STARTUP
// ==============
app.listen(3000, () => { console.log('Server has started!') });