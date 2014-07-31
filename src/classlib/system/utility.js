(function(undefined){

   var Namespace = require('./namespace');
   var System = require('../system');
   var utils = require('../../utils');

    var Utility = new Namespace("Utility", System, utils);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Utility;
    } else {
        this.System = System;
    }

})();
