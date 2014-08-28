(function(undefined){

    // ============ Model

    var modelPath = __dirname + '/users/';

    var model = require(__dirname + '/../../lib/api/model');
    var util = require('util');

    var User = function() {
        model.apply(this, arguments);
        return this;
    };
    util.inherits(User, model);

    for(var key in model) {
        User[key] = model[key];
    }
    User.directory.path = modelPath;

    // ============ Controller

    var controller = require(__dirname + '/../../lib/api/controller');
    var users = new controller(User);


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        exports.Model = User;
        exports.Controller = users;
    } else {
        this.Model = User;
        this.Controller = users;
    }
})();


