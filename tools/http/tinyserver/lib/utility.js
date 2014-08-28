(function(undefined){

    var path = require('path');

    var utility = {
        basePath : path.resolve(__dirname + '/../'),
        timestamp : function() {
            return (new Date).getTime();
        },
        generateResourceUrl : function(dir, id) {
            if (!id) throw new Error('This resource doesn\'t have an id yet!');
            return '/api/' + dir.split('/api/')[1] + id;
        },
        iterateFiles : function(dir, callback) {
            var fs = require('fs');
            var files = fs.readdirSync(dir);
            for (var i = 0; i < files.length; ++i) {
                callback(files[i]);
            }
        },
        bind : function(obj, params) {
            for(var key in params) {
                obj[key] = params[key];
            }
            return obj;
        }
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = utility;
    } else {
        this.utility = utility;
    }
})();





