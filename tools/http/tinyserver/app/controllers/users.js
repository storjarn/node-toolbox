(function(undefined){

    var fs = require('fs');

    var util = require('../../../../../src/utils.js');
    var perf = (new util.performance());

    var utility = require('./../utility');

    var controller = require('./../../lib/app/controller');

    var users = function() {
        model.apply(this, arguments);

        this.Resources.User = {
            'url' : '/api/v1/users',
            get : function(id) {
                if (!id) {
                    return require(path.join(utility.basePath, this.url, id);
                } else {
                    var controller = require(path.join(utility.basePath, this.url));
                    return controller['get']();
                }
            }
        }

        return this;
    };
    util.inherits(users, controller);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = users;
    } else {
        this.controller = users;
    }
})();


