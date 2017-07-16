var request = require("request");
var moment = require("moment");

// nyt query
var key = "51ff089fef0f43c385905c82a4808554",
  query = "viet OR nam OR cambodia OR communism";

// 50 years ago today
var date = moment().subtract(50, "years");

request.get({
 url: "https://api.nytimes.com/svc/search/v2/articlesearch.json",
 qs: {
  "api-key": key,
  "fq": query,
  "begin_date": date.format("YYYYMMDD"),
  "end_date": date.format("YYYYMMDD")
 },
}, function(err, response, body) {
 var responseData = JSON.parse(body).response;
 var docs = responseData.docs;
 var hits = responseData.meta.hits;
 console.log("hits: " + hits);
 docs.forEach((d, i) => {
   var docUrl = d.web_url;
   var abstract = d.abstract;
   console.log("headline: " + abstract);
   console.log("url: " + docUrl);
 });
});

function makeRequest(page) {
  request.get({
    url: "https://api.nytimes.com/svc/search/v2/articlesearch.json",
    qs: {
      "api-key": key,
      "fq": query,
      "begin_date": date.format("YYYYMMDD"),
      "end_date": date.format("YYYYMMDD"),
      "page": page
    },
  }, function(err, response, body) {

    body = JSON.parse(body);
    console.log(body);
    //
    // var docs = body.response.docs;
    //
    // docs.forEach((d, i) => {
    //   console.log(d);
    // });
  });
}
