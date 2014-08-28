(function(undefined){

    // ============ Model

    var modelPath = __dirname + '/characters/';

    var model = require(__dirname + '/../../../lib/api/model');
    var util = require('util');

    var Character = function() {
        model.apply(this, arguments);
        return this;
    };
    util.inherits(Character, model);

    for(var key in model) {
        Character[key] = model[key];
    }
    Character.directory.path = modelPath;

    // ============ Controller

    var controller = require(__dirname + '/../../../lib/api/controller');
    var characters = new controller(Character);


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        exports.Model = Character;
        exports.Controller = characters;
    } else {
        this.Model = Character;
        this.Controller = characters;
    }
})();


