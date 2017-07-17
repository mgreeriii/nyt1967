var request = require("request");
var _ = require("underscore");

var downloadPDF = require('./download_pdf');

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

function buildStatusMessage(tweetHeadline) {
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

    return tweetHeadline +  " " + tweetHashtag;
}

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

            // compose the tweet status message
            tweetObj.statusMsg = buildStatusMessage(d.headline.main);

            // set source url of the article
            tweetObj.url = "http://query.nytimes.com/mem/archive-free/pdf?res=" + d.web_url.split("res=")[1];

            console.log("Tweet status: " + tweetObj.statusMsg);
            console.log("Tweet article url: " + tweetObj.url + "\n");
            // some variables for creating a unique pdf file name
            tweetObj.date = d.pub_date.split("T")[0];
            tweetObj.page = page + 1;
            tweetObj.pageIndex = i + 1;

            tweetObj.pdfFileName = "temp/" + tweetObj.date + "_" + tweetObj.page + "_" + tweetObj.pageIndex + ".pdf";
            downloadPDF(tweetObj.url, tweetObj.pdfFileName);
        });
    });
}

var makeRequestLimited = _.rateLimit(makeRequest, 10000);

module.exports = makeRequestLimited;
