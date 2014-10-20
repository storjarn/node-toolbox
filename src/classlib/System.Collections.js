(function(undefined){

   var System = require('./System');

    var Collections = new System.Namespace("Collections", System);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Collections;
    } else {
        this.System = System;
    }

})();
