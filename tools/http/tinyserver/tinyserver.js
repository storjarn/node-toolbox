var sys = require('sys');
var fs = require('fs');
var pathfs = require('path');
var http = require('http');
var url_parse = require("url").parse;
var qs = require('querystring');
var util = require('../../../src/utils.js');
var utility = require('./lib/utility');

var port = 8000;

function clone(obj){
    // return JSON.parse(JSON.stringify(obj));
    return JSON.parse(util.inspect(obj, { showHidden: true, depth: null }));
}

/**
 * Removes a module from the cache
 */
require.uncache = function (moduleName) {
    // Run over the cache looking for the files
    // loaded by the specified module name
    return this.searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
        return true;
    });
};

/**
 * Runs over the cache to search for all the cached
 * files
 */
require.searchCache = function (moduleName, callback) {
    var ret = false;
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function run(mod) {
            // Go over each of the module's children and
            // run over it
            mod.children.forEach(function (child) {
                run(child);
            });

            // Call the specified callback providing the
            // found module
            ret = callback(mod);
        })(mod);
    }
    return ret;
};

JSON.stringifyPretty = function(data, replacer){
    return JSON.stringify(data, replacer, 4)
}

//========================== Server Request/Response layer

function handleRequest(req, res) {

    var self = this;

    console.log('=======================================');

    var perf = (new util.performance());
    console.log('Request:  ', req.method, req.url);
    req.setEncoding('utf8');

    // console.log(req.headers);

    function endRequest(){
        parseQS();
    }
    req.on('end', endRequest);

    function endResponse(){
        console.log('Request took ' + perf.end('ms') + ' ms');
        console.log('=======================================');
    }
    res.on('finish', endResponse);

    function serverError(message) {
        message = (message || "The server experienced an internal error\n") + "";
        res.writeHead(404, {
            "Content-Type": "text/plain",
            "Content-Length": message.length
        });
        if (req.method !== "HEAD") {
            res.write(message);
        }
        self.emit('serverError');

        res.end();
        // console.log('=======================================');
    }
    req.on('error', serverError);

    var refreshCache = false;
    if (req.headers['cache-control'] == 'max-age=0') {
        refreshCache = true;
    }
    req.searchCache = require.searchCache;
    req.uncache = require.uncache;

    //========================== Request


    this.params = {};
    this.headers = [];
    this.body = '';

    var uri = url_parse(req.url);
    var path = uri.pathname;
    if (path.length > 1 && path.charAt(path.length-1) == '/') {
        path = path.slice(0, path.length - 1);
    }
    if (!path) {
        path = '/';
    }

    // console.log(path);

    var content_type = mime.getMime(path);
    // console.log(content_type);

    function parseQS() {
        var query = typeof uri.query == 'string' ? qs.parse(uri.query) : uri.query;
        for (var key in query) {
            if (self.params[key] !== undefined) {
                if (typeof self.params[key] != 'array') {
                    self.params[key] = [self.params[key]];
                }
                self.params[key].push(query[key]);
            } else {
                self.params[key] = query[key];
            }
        }
        req.params = self.params;

        // console.log(self.params);
    }

    //Checks a Javascript object if the key exists and if the value is a match on that key.  'value' can be an array (OR query).  Will partially match.  Returns true || false;
    req.queryObject = function(key, value, obj){
        function test(obj, key, value) {
            if (key in obj && obj[key].indexOf(value) > -1) {
                return true
            } else {
                return false;
            }
        }
        var include = false;
        if (typeof value == 'array') {
            for (var j = 0; j < value.length; ++j) {
                if (test(obj, key, value[j])) {
                    include = true;
                    break;
                }
            }
        } else {
            if (test(obj, key, value)) {
                include = true;
            }
        }
        return include;
    }

    function onData(data) {
        console.log("Data received", data);
        self.body += data;
        // Too much POST data, kill the connection!
        if (self.body.length > 1e6) {
            req.connection.destroy();
        }
        self.emit('onData');
    }

    function onReadable(){
        var ret = '';
        while (ret += req.read()){
            console.log("Readable received", ret);
        }
        self.body += ret;
        return ret;
    }

    function onEnd() {
        // console.log("Request ending");
        self.params = !!self.body ? qs.parse(self.body) : {};
        // console.log(self.params);
        // use self.params['blah'], etc.
        self.emit('onEnd');
        self.body = '';

        parseQS();
        emitResponse.call(self, req, res);
    }

    if (req.url === '/favicon.ico') {
       res.writeHead(200, {'Content-Type': 'image/x-icon'} );
       res.end();
       // console.log('favicon requested');
       return;
    }

    if (req.method == 'POST') {
        req.on('data', onData);
        // req.on("readable", onReadable);
        req.on('end', onEnd);
    } else {
        parseQS();
        emitResponse.call(self, req, res);
    }

    //========================== Response

    res.redirect = function redirect(location) {
        res.writeHead(302, {"Location": location});
        res.end();
    }

    function emitResponse(req, res) {

        // console.log("Emitting response");

        var self = this;

        function notFound(message) {
            message = (message || "Not Found\n") + "";
            res.writeHead(404, {
                "Content-Type": "text/plain",
                "Content-Length": message.length
            });
            if (req.method !== "HEAD") {
                res.write(message);
            }
            self.emit('notFound');

            res.end();
            // console.log('=======================================');
        }

        function simpleResponse(code, body, content_type, extra_headers) {
            body = body || "";
            res.writeHead(code, (extra_headers || []).concat(
                               [ ["Content-Type", content_type],
                                 ["Content-Length", Buffer.byteLength(body, 'utf8')]
                               ]));
            if (req.method !== "HEAD")
                res.write(body, 'utf8');
            res.end();
        }

        res.simpleText = function (code, body, extra_headers) {
            simpleResponse(code, body, "text/plain", (extra_headers || []).concat(self.headers));
        };

        res.simpleHtml = function (code, body, extra_headers) {
            simpleResponse(code, body, "text/html", (extra_headers || []).concat(self.headers));
        };

        res.simpleJson = function (code, json, extra_headers) {
            simpleResponse(code, JSON.stringify(json), "application/json", (extra_headers || []).concat(self.headers));
        };

        res.notFound = function (message) {
            notFound(message);
        };

        res.onlyHead = function (code, extra_headers) {
            res.writeHead(code, (extra_headers || [])
                .concat(self.headers)
                .concat(
                    [["Content-Type", content_type]]
                )
            );
            res.end();
        }

        // console.log(util.inspect(self, { showHidden: true, depth: 4 }));
        // res.simpleJson(200, {test:true});
        // return;

        var controllerPath = '';
        var resourceId = 0;
        controllerPath = path.split('/');

        if (!!controllerPath[controllerPath.length-1]
                && !isNaN(parseInt(controllerPath[controllerPath.length-1]))) {
            resourceId = parseInt(controllerPath[controllerPath.length-1]);
            controllerPath = controllerPath.slice(0, controllerPath.length-1).join('/');
        } else {
            controllerPath = path;
            resourceId = 0;
        }

        // console.log(controllerPath);

        var RESPONSE_TYPE = {
            JSON : 1,
            MODULE : 2,
            HTML : 3,
            CONTROLLER : 4,
            OTHER : 5
        }

        var resourcePath = '';
        var resourceType = 0;

        if (req.method == "GET" && fs.existsSync('.' + path + '.json')) {
            resourcePath = '.' + path + '.json';
            resourceType = RESPONSE_TYPE.JSON;
        } else if (fs.existsSync('./public' + path) && fs.statSync('./public' + path).isFile()) {
            resourcePath = './public' + path;
            resourceType = RESPONSE_TYPE.HTML;
        } else if (fs.existsSync('.' + path + '.js')) {
            resourcePath = '.' + path + '.js';
            resourceType = RESPONSE_TYPE.MODULE;
        } else if (req.method != "GET" && fs.existsSync('.' + controllerPath + '.js')) {
            resourcePath = '.' + controllerPath + '.js';
            req.params.resourceId = resourceId;
            resourceType = RESPONSE_TYPE.MODULE;
        } else if (path.charAt(path.length-1) == '/') {
            if (fs.existsSync('./public' + path + 'index.html')) {
                resourcePath = './public' + path + 'index.html';
                resourceType = RESPONSE_TYPE.HTML;
            } else {
                self.body = "<h1>No index file found.  Please place an index.html file in "+'./public' + path+"</h1>";
                res.simpleHtml(200, self.body);
                return;
            }
        }

        if (refreshCache) {
            // require.uncache(resourcePath);
            console.log('Cache max-age set to 0');
        }

        if (path.indexOf('lib/') > -1) {
            resourcePath = '';
            resourceType = 0;
            // console.log("whoops")
        }

        switch(resourceType) {
            case RESPONSE_TYPE.JSON :
                res.simpleJson(200, require(resourcePath));
                break;
            case RESPONSE_TYPE.MODULE :
                var controller = require(resourcePath).Controller;
                // console.log(controller);
                res.simpleJson(200, controller[req.method.toLowerCase()](req, res) );
                break;
            case RESPONSE_TYPE.HTML :
                var content_type = mime.getMime(resourcePath);
                self.body = fs.readFileSync(resourcePath, {encoding: 'utf8'});
                simpleResponse(200, self.body, content_type);
                break;
            case RESPONSE_TYPE.OTHER :
                break;
            default :
                res.notFound('That resource doesn\'t exist');
                break;
        }
    }
}

var server = http.createServer(handleRequest);
server.listen(port);
console.log("Server running at http://127.0.0.1:"+port+"/");

server.api = {
    files : []
}
server.app = {
    files : []
}

function parseAPIFolder(dir) {
    dir = pathfs.resolve(dir);
    utility.iterateFiles(dir, function(item){
        var resolvedPath = dir + '/' + item;
        var uriPath = resolvedPath.replace(__dirname, '');
        uriPath = uriPath.replace(pathfs.extname(uriPath), '');
        if (item != '.DS_Store') {
            if (fs.statSync(resolvedPath).isFile()) {
                if (item != 'index.json') {
                    if (server.api.files.indexOf(uriPath) == -1) {
                        server.api.files.push(uriPath);
                        // console.log(uriPath);
                    }
                }
            } else if (fs.statSync(resolvedPath).isDirectory()) {
                parseAPIFolder(resolvedPath);
            }
        }
    })
    // console.log(server.api);
}

function parseAppFolder(dir) {
    dir = pathfs.resolve(dir);
    utility.iterateFiles(dir, function(item){
        var resolvedPath = dir + '/' + item;
        var uriPath = resolvedPath.replace(__dirname + '/app/controllers/', '');
        uriPath = '/' + uriPath.replace(pathfs.extname(uriPath), '');
        if (item != '.DS_Store') {
            if (fs.statSync(resolvedPath).isFile()) {
                if (server.app.files.indexOf(uriPath) == -1) {
                    server.app.files.push(uriPath);
                    // console.log(uriPath);
                }
            } else if (fs.statSync(resolvedPath).isDirectory()) {
                parseAPIFolder(resolvedPath);
            }
        }
    })
    // console.log(server.app);
}

parseAPIFolder('./api/');
console.log(server.api);
parseAppFolder('./app/controllers/');
console.log(server.app);


//========================== Mime handling

// Mini mime module for static file serving
var DEFAULT_MIME = 'application/octet-stream';
var mime = exports.mime = {

  getMime: function getMime(path) {
    var index = path.lastIndexOf(".");
    if (index < 0) {
      return DEFAULT_MIME;
    }
    return mime.TYPES[path.substring(index).toLowerCase()] || DEFAULT_MIME;
  },

  TYPES : { ".3gp"   : "video/3gpp",
            ".a"     : "application/octet-stream",
            ".ai"    : "application/postscript",
            ".aif"   : "audio/x-aiff",
            ".aiff"  : "audio/x-aiff",
            ".asc"   : "application/pgp-signature",
            ".asf"   : "video/x-ms-asf",
            ".asm"   : "text/x-asm",
            ".asx"   : "video/x-ms-asf",
            ".atom"  : "application/atom+xml",
            ".au"    : "audio/basic",
            ".avi"   : "video/x-msvideo",
            ".bat"   : "application/x-msdownload",
            ".bin"   : "application/octet-stream",
            ".bmp"   : "image/bmp",
            ".bz2"   : "application/x-bzip2",
            ".c"     : "text/x-c",
            ".cab"   : "application/vnd.ms-cab-compressed",
            ".cc"    : "text/x-c",
            ".chm"   : "application/vnd.ms-htmlhelp",
            ".class"   : "application/octet-stream",
            ".com"   : "application/x-msdownload",
            ".conf"  : "text/plain",
            ".cpp"   : "text/x-c",
            ".crt"   : "application/x-x509-ca-cert",
            ".css"   : "text/css",
            ".csv"   : "text/csv",
            ".cxx"   : "text/x-c",
            ".deb"   : "application/x-debian-package",
            ".der"   : "application/x-x509-ca-cert",
            ".diff"  : "text/x-diff",
            ".djv"   : "image/vnd.djvu",
            ".djvu"  : "image/vnd.djvu",
            ".dll"   : "application/x-msdownload",
            ".dmg"   : "application/octet-stream",
            ".doc"   : "application/msword",
            ".dot"   : "application/msword",
            ".dtd"   : "application/xml-dtd",
            ".dvi"   : "application/x-dvi",
            ".ear"   : "application/java-archive",
            ".eml"   : "message/rfc822",
            ".eps"   : "application/postscript",
            ".exe"   : "application/x-msdownload",
            ".f"     : "text/x-fortran",
            ".f77"   : "text/x-fortran",
            ".f90"   : "text/x-fortran",
            ".flv"   : "video/x-flv",
            ".for"   : "text/x-fortran",
            ".gem"   : "application/octet-stream",
            ".gemspec" : "text/x-script.ruby",
            ".gif"   : "image/gif",
            ".gz"    : "application/x-gzip",
            ".h"     : "text/x-c",
            ".hh"    : "text/x-c",
            ".htm"   : "text/html",
            ".html"  : "text/html",
            ".ico"   : "image/vnd.microsoft.icon",
            ".ics"   : "text/calendar",
            ".ifb"   : "text/calendar",
            ".iso"   : "application/octet-stream",
            ".jar"   : "application/java-archive",
            ".java"  : "text/x-java-source",
            ".jnlp"  : "application/x-java-jnlp-file",
            ".jpeg"  : "image/jpeg",
            ".jpg"   : "image/jpeg",
            ".js"    : "application/javascript",
            ".json"  : "application/json",
            ".log"   : "text/plain",
            ".m3u"   : "audio/x-mpegurl",
            ".m4v"   : "video/mp4",
            ".man"   : "text/troff",
            ".mathml"  : "application/mathml+xml",
            ".mbox"  : "application/mbox",
            ".mdoc"  : "text/troff",
            ".me"    : "text/troff",
            ".mid"   : "audio/midi",
            ".midi"  : "audio/midi",
            ".mime"  : "message/rfc822",
            ".mml"   : "application/mathml+xml",
            ".mng"   : "video/x-mng",
            ".mov"   : "video/quicktime",
            ".mp3"   : "audio/mpeg",
            ".mp4"   : "video/mp4",
            ".mp4v"  : "video/mp4",
            ".mpeg"  : "video/mpeg",
            ".mpg"   : "video/mpeg",
            ".ms"    : "text/troff",
            ".msi"   : "application/x-msdownload",
            ".odp"   : "application/vnd.oasis.opendocument.presentation",
            ".ods"   : "application/vnd.oasis.opendocument.spreadsheet",
            ".odt"   : "application/vnd.oasis.opendocument.text",
            ".ogg"   : "application/ogg",
            ".p"     : "text/x-pascal",
            ".pas"   : "text/x-pascal",
            ".pbm"   : "image/x-portable-bitmap",
            ".pdf"   : "application/pdf",
            ".pem"   : "application/x-x509-ca-cert",
            ".pgm"   : "image/x-portable-graymap",
            ".pgp"   : "application/pgp-encrypted",
            ".pkg"   : "application/octet-stream",
            ".pl"    : "text/x-script.perl",
            ".pm"    : "text/x-script.perl-module",
            ".png"   : "image/png",
            ".pnm"   : "image/x-portable-anymap",
            ".ppm"   : "image/x-portable-pixmap",
            ".pps"   : "application/vnd.ms-powerpoint",
            ".ppt"   : "application/vnd.ms-powerpoint",
            ".ps"    : "application/postscript",
            ".psd"   : "image/vnd.adobe.photoshop",
            ".py"    : "text/x-script.python",
            ".qt"    : "video/quicktime",
            ".ra"    : "audio/x-pn-realaudio",
            ".rake"  : "text/x-script.ruby",
            ".ram"   : "audio/x-pn-realaudio",
            ".rar"   : "application/x-rar-compressed",
            ".rb"    : "text/x-script.ruby",
            ".rdf"   : "application/rdf+xml",
            ".roff"  : "text/troff",
            ".rpm"   : "application/x-redhat-package-manager",
            ".rss"   : "application/rss+xml",
            ".rtf"   : "application/rtf",
            ".ru"    : "text/x-script.ruby",
            ".s"     : "text/x-asm",
            ".sgm"   : "text/sgml",
            ".sgml"  : "text/sgml",
            ".sh"    : "application/x-sh",
            ".sig"   : "application/pgp-signature",
            ".snd"   : "audio/basic",
            ".so"    : "application/octet-stream",
            ".svg"   : "image/svg+xml",
            ".svgz"  : "image/svg+xml",
            ".swf"   : "application/x-shockwave-flash",
            ".t"     : "text/troff",
            ".tar"   : "application/x-tar",
            ".tbz"   : "application/x-bzip-compressed-tar",
            ".tci"   : "application/x-topcloud",
            ".tcl"   : "application/x-tcl",
            ".tex"   : "application/x-tex",
            ".texi"  : "application/x-texinfo",
            ".texinfo" : "application/x-texinfo",
            ".text"  : "text/plain",
            ".tif"   : "image/tiff",
            ".tiff"  : "image/tiff",
            ".torrent" : "application/x-bittorrent",
            ".tr"    : "text/troff",
            ".ttf"   : "application/x-font-ttf",
            ".txt"   : "text/plain",
            ".vcf"   : "text/x-vcard",
            ".vcs"   : "text/x-vcalendar",
            ".vrml"  : "model/vrml",
            ".war"   : "application/java-archive",
            ".wav"   : "audio/x-wav",
            ".wma"   : "audio/x-ms-wma",
            ".wmv"   : "video/x-ms-wmv",
            ".wmx"   : "video/x-ms-wmx",
            ".wrl"   : "model/vrml",
            ".wsdl"  : "application/wsdl+xml",
            ".xbm"   : "image/x-xbitmap",
            ".xhtml"   : "application/xhtml+xml",
            ".xls"   : "application/vnd.ms-excel",
            ".xml"   : "application/xml",
            ".xpm"   : "image/x-xpixmap",
            ".xsl"   : "application/xml",
            ".xslt"  : "application/xslt+xml",
            ".yaml"  : "text/yaml",
            ".yml"   : "text/yaml",
            ".zip"   : "application/zip"
          }
};

//========================== Process Management

process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
    return (function(options, err){
        return function(err) {
            if (options.cleanup) console.log('\nclean exit');
            if (err) console.log(err.stack);
            if (options.exit) process.exit(0);
        }
    })(options, err);
}

//do something when app is closing
process.on('exit', exitHandler({cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler({exit:true}));
process.on('SIGTSTP', exitHandler({exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler({exit:true}));
