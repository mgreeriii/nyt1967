var request = require("request");
var cheerio = require("cheerio");
var http = require("http");
var fs = require("fs");
var PDFImage = require("pdf-image").PDFImage;

var downloadPDF = function(input, output){

    // a stream to write the pdf file for downloading
    var file = fs.createWriteStream(output);

    // get the html of the nyt page
    request(input, function(error, response, body) {

        if (!error && response.statusCode == 200) {
            // load cheerio
            var $ = cheerio.load(body);

            // find the pdf url in the response
            var pdf = $("iframe").attr("src");

            console.log("PDF url: " + pdf);

            // time to download the pdf
            if (pdf) {
                var request = http.get(pdf, function (response) {

                    // pipe the response to the file
                    var stream = response.pipe(file);

                    // when it's done, we'll convert to an image and post the tweet
                    stream.on("finish", function () {

                        // convert to image, with white background
                        var pdfImage = new PDFImage(output, {
                            convertOptions: {
                                '-background': 'white',
                                '-flatten': ''
                            }
                        });
                        pdfImage.convertPage(0);
                    });

                });
            }

        }

    });

};

module.exports = downloadPDF;
