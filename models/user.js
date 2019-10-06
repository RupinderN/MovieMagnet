var mongoose = require('mongoose'),
	passportLocalMongoose = require('passport-local-mongoose');


var UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	rating: 0,
	getEmails: {type: String, default: false},
	movies: Array
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);