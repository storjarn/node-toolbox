(function(undefined){
   
   var System = require('./System')
   var Namespace = System.Namespace
   var utils = require('../utils')

    var Utility = new Namespace("Utility", System, utils);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Utility;
    } else {
        // this.Utility = Utility;
    }

})();
