# Movie Magnet

View the project [here](https://github.com/RupinderN/MovieMagnet)!

This web app is intended to filter movies currently playing in theatres by IMDB ratings of your choice, and if you have signed up for the site, you may also receive emails if a movie of your specific criteria is now playing in theatres.


# Motivation

For picky movie watchers, IMDB ratings can be a way to determine whether or not you're going to be investing your time in watching a certain movie. As someone who always does this and loves watching movies on the big screen, I thought of creating a project that lets you scope all IMDB ratings of the movies currently in theatres, and filtering based off your preferred ratings. If a movie above your desired rating was to come out in theatres without your knowledge, you may also be directly emailed about it.

# Project Screenshots

![Home Page](https://github.com/RupinderN/MovieMagnet/blob/master/public/assets/home.PNG)

Main Page:

![Main Page Top](https://github.com/RupinderN/MovieMagnet/blob/master/public/assets/main.gif)

Example Movie Page:

![Main Page Continued](https://github.com/RupinderN/MovieMagnet/blob/master/public/assets/show.PNG)


# Installation and Setup Instructions

Clone down this repository. You will need ```node``` and ```npm``` installed globally on your machine.

Requires a [MongoDB](https://www.mongodb.com/) Database to be used.

Installation:

```npm install```

Open http://localhost:3000 to view it in the browser.


# Built With

* [Node.js](https://nodejs.org/en/) - Runtime Environment used
* [Express.js](https://expressjs.com/) - Back-end framework
* [Bootstrap](https://getbootstrap.com/) - Front-end framework
* [TheMovieDB API](https://www.themoviedb.org/?language=en-US) - API used to get currently playing movies
* ['imdb' npm package](https://www.npmjs.com/package/imdb) - used to find IMDB rating of a movie
* [EJS](https://ejs.co/) - used to generate HTML markup with plain JavaScript




