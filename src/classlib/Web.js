(function(undefined){

   var Namespace = require('../base/Base.Namespace');

    var Web = new Namespace("Web");

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Web;
    } else {
        this.Web = Web;
    }

})();
