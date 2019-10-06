
const request = require('request'),
	  imdb = require('imdb');

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

    await Promise.all(promiseArray).then(result => {
		console.log(result);
	})
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
				resolve("N/A");
			}
        }));
    };

    await Promise.all(promiseArray);
    return Promise.all(promiseArray);
}


async function ratings() {
	
	var obj = {};
    let movie_ids = await get_ids();
    let imdb_pages = await insert_ids(movie_ids);
    final_ratings = await final(imdb_pages);
	return obj = {"ratings": final_ratings};
    
}

ratings().then(result => {
	console.log(result);
})





