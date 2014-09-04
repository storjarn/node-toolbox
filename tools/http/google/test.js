(function(undefined){

    var test = {
        urls : {
            Google : {
                Auth : 'https://www.google.com/accounts/ServiceLogin?',
                Auth2 : 'https://www.google.com/accounts/ServiceLoginAuth',
                BookmarksAPI : 'https://www.google.com/bookmarks/api/threadsearch?',
                CheckCookie : "https://www.google.com/accounts/CheckCookie?"
            }
        }
    };

    var request = require('request');
    var toughCookie = require('tough-cookie');
    var cheerio = require('cheerio');

    var j = request.jar();

    var reqOptions = {
        url : '',
        auth : {
            username: process.env.GOOGLEUSERPERSONAL,
            password: process.env.GOOGLEPASSWORDPERSONAL
        },
        followAllRedirects : true,
        jar: j
    }

    var cookieOptions = {
        continue : "https://www.google.com/bookmarks/l",
        followup : "https://www.google.com/bookmarks/l",
        service : "bookmarks",
        chtml : "LoginDoneHtml"
    }

    var bookmarksAPIOptions = {
        q : '',
        start : '',
        fo : '',
        g : ''
    }

    function testError(err) {
        if (err) {
            console.error('request failed:', err);
            return false;
        }
        return true;
    }

    function testResponse(res) {
        if (res.statusCode != 200) {
            console.log("=============================================")
            console.log("Error: ", res.statusCode);
            console.log("Request Headers: ", res.req._header)
            console.log("Response Headers: ", res.headers)
            console.log("=============================================")
            $ = cheerio.load(res.body);
            console.log("Body: ", $('title').text());
            return false
        }
        return true;
    }

    function prepareRequest(res, url, qs) {
        reqOptions.url = url;
        reqOptions.qs = qs;
        // reqOptions.headers = res.headers;
    }

    reqOptions.url = test.urls.Google.Auth;

    request.get(reqOptions, function(err, httpResponse, body) {

        if (!testError(err)) {
            return
        }

        if (testResponse(httpResponse)) {
            prepareRequest(httpResponse, test.urls.Google.Auth2, {})
            reqOptions.form = {
                Email: process.env.GOOGLEUSERPERSONAL,
                Passwd: process.env.GOOGLEPASSWORDPERSONAL,
                PersistentCookie: 'yes',
                GALX: 'yitCPZVu8Ks',
                _utf8: '&#9731;',
                bgresponse: 'js_disabled'
            }
            request.post(reqOptions, function(err, httpResponse, body) {

                if (!testError(err)) {
                    return
                }

                if (testResponse(httpResponse)) {

                    console.log(httpResponse.body);

                    if (httpResponse.headers['x-auto-login']) {

                    }
                    prepareRequest(httpResponse, test.urls.Google.CheckCookie, cookieOptions)
                    request.get(reqOptions, function(err, httpResponse, body) {

                        if (!testError(err)) {
                            return
                        }

                        if (testResponse(httpResponse)) {
                            prepareRequest(httpResponse, test.urls.Google.BookmarksAPI, bookmarksAPIOptions)
                            request.get(reqOptions, function(err, httpResponse, body) {

                                if (!testError(err)) {
                                    return
                                }
                                if (testResponse(httpResponse)) {

                                }
                            })
                        }
                    })
                }
            })
        }
    })

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        exports.test = test;
    } else {
        this.test = test;
    }
})();


