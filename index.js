var request = require("request");
var moment = require("moment");
var config = require("config");

// local modules
var makeRequest = require('./make_request');

var apiConfig = config.get("apiConfig");

// nyt query
var key = apiConfig.get("nytKey");
var query = "viet OR nam OR cambodia OR communism";

// 50 years ago today
var date = moment().subtract(50, "years");

request.get({
    url: "https://api.nytimes.com/svc/search/v2/articlesearch.json",
    qs: {
        "api-key": key,
        "fq": query,
        "begin_date": date.format("YYYYMMDD"),
        "end_date": date.format("YYYYMMDD")
    }
}, function (err, response, body) {
    var responseData = JSON.parse(body).response;
    var docs = responseData.docs;
    var hits = responseData.meta.hits;
    var pages = Math.ceil(hits/10);
    console.log("hits: " + hits);
    console.log("on pages: " + pages);

    for (var i = 0; i < pages; i++) {
        makeRequest(key, query, date, i);
    }
});
