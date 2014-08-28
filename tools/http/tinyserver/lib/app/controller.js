(function(undefined){

    var fs = require('fs');

    var util = require('../../../../../src/utils.js');
    var perf = (new util.performance());

    var utility = require('./../utility');

    var controller = function() {

        this.Resources = {}

        this._loadResource = function(name) {
        }

        return this;
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = controller;
    } else {
        this.controller = controller;
    }
})();


