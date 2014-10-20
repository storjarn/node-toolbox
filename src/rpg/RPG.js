(function(undefined) {

    var Namespace = require('../base/Base.Namespace');

    /* public */
    var RPG = new Namespace("RPG");

    /* private */

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = RPG;
    } else {
        this.RPG = RPG;
    }

})();
