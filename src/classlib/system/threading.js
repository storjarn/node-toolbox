(function(undefined){

   var Namespace = require('./namespace');
   var System = require('../system');

    var Threading = new Namespace("Threading", System);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Threading;
    } else {
        this.System = System;
    }

})();
