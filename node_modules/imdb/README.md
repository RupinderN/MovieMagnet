imdb
====
![npm](https://img.shields.io/npm/v/imdb.svg)
![downloads](https://img.shields.io/npm/dt/imdb.svg)

An IMDB API for getting information on your favourite movies!

## Installing
Install via [npm](https://npmjs.com)

    $ npm install imdb

## Running / Building
To run the example:

    $ npm install
    $ node examples/movie.js
    
## API / Usage

Provide the IMDB ID and go! Also see the `examples/` folder for inspiration!

```javascript
var imdb = require('imdb');

imdb('tt3659388', function(err, data) {
  if(err)
    console.log(err.stack);

  if(data)
    console.log(data);
});
```

This will return an object similar to this:

```
{ title: 'The Martian',
  year: '2015',
  contentRating: 'PG-13',
  runtime: '2h 24min',
  description: 'During a manned mission to Mars, Astronaut Mark Watney is presumed dead after a fierce storm and left behind by his crew. But Watney has survived and finds himself stranded and alone on the hostile planet. With only meager supplies, he must draw upon his ingenuity, wit and spirit to subsist and find a way to signal to Earth that he is alive.',
  rating: '8.1',
  poster: 'http://ia.media-imdb.com/images/M/MV5BMTc2MTQ3MDA1Nl5BMl5BanBnXkFtZTgwODA3OTI4NjE@._V1_UX182_CR0,0,182,268_AL_.jpg',
  genre: [ 'Adventure', ' Drama', ' Sci-Fi' ],
  director: 'Ridley Scott',
  metascore: '80',
  writer: 'Drew Goddard' }

```