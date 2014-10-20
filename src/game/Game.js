(function(undefined){

   var Namespace = require('../base/Base.Namespace');

    var Game = new Namespace("Game");

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Game;
    } else {
        this.Game = Game;
    }

})();
