(function(undefined) {

    var Namespace = require('../base/Base.Namespace');

    /* public */
    var Data = new Namespace("Data");

    /* private */

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Data;
    } else {
        this.Data = Data;
    }

})();
