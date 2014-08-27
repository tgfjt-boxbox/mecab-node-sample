'use strict';

var conf = require('config');
var twitter = require('twitter');
var mecab = require('mecab-ffi');
var _ = require('underscore');


// Twitter
var t = new twitter({
	consumer_key: conf.TWITTER.API_KEY,
	consumer_secret: conf.TWITTER.API_SECRET,
	access_token_key: conf.TWITTER.TOKEN,
	access_token_secret: conf.TWITTER.TOKEN_SECRET
});

// Twitter Search
t.get('/search/tweets.json', {
	q: 'Javascript exclude:retweets',
	lang : 'ja',
	count: 100
}, function(data) {
	var text = data.statuses.map(function(item) {
		return item.text;
	});

	// MeCab でパース
	mecab.parse(text.join('\n'), function(err, res) {
		if (err) {
			throw err;
		}

		var adjective = res.map(function(element) {
			if (element[1] === '形容詞') {
				// 活用前に復元したもの
				return element[7];
			}
		}).filter(function(item) {
			return item !== undefined;
		});

		var resultdata = _.chain(adjective)
			.countBy()
			.pairs()
			.sortBy(function(item) {
				return -item[1];
			})
			.map(function(item) {
				return {
					word: item[0],
					count: item[1]
				};
			})
			.value();

		console.log(resultdata);
	});

});

