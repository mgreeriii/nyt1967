var request = require("request");
var _ = require("underscore");

// underscore rate limit function
_.rateLimit = function(func, rate, async) {
    var queue = [];
    var timeoutRef = false;
    var emptyingQueue = false;

    var emptyQueue = function () {
        if (queue.length) {
            emptyingQueue = true;
            _.delay(function () {
                if (async) {
                    _.defer(function () {
                        queue.shift().call();
                    })
                } else {
                    queue.shift().call();
                }
                emptyQueue();
            }, rate)
        } else {
            emptyingQueue = false;
        }
    };

    return function () {
        var args = _.map(arguments, function(e) { return e; });
        queue.push(_.bind.apply(this, [func, this].concat(args)));
        if (!emptyingQueue) { emptyQueue(); }
    };

};

function makeRequest(key , query, date, page) {
    request.get({
        url: "https://api.nytimes.com/svc/search/v2/articlesearch.json",
        qs: {
            "api-key": key,
            "fq": query,
            "begin_date": date.format("YYYYMMDD"),
            "end_date": date.format("YYYYMMDD"),
            "page": page
        }
    }, function (err, response, body) {

        body = JSON.parse(body);
        var docs = body.response.docs;

        docs.forEach(function(d, i) {
            var tweetObj = {};

            tweetObj.statusMsg = d.headline.main;
            var tweetHeadline = tweetObj.statusMsg;
            var tweetHashtag = '#1967LIVE';

            var endLen = tweetHashtag.length + 1;

            // the tweet content is dependent upon the length of the statusMsg
            // if the statusMsg is too long, we'll truncate it and add trailing ellipses
            if (tweetHeadline.length > (140 - endLen - 3)) {
                tweetHeadline = tweetHeadline.substr(0 , (140 - endLen - 3));

                // add the ellipses
                var li = tweetHeadline.lastIndexOf(" ");
                tweetHeadline = tweetHeadline.substr(0, li) + "...";
            }

            tweetObj.statusMsg = tweetHeadline +  " " + tweetHashtag;

            console.log("Tweet status: " + tweetObj.statusMsg);
        });
    });
}

var makeRequestLimited = _.rateLimit(makeRequest, 10000);

module.exports = makeRequestLimited;
