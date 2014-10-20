(function(undefined){

   var System = require('./System')
   var Namespace = System.Namespace

    var Threading = new Namespace("Threading", System);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Threading;
    } else {
        // this.Threading = Threading;
    }

})();
