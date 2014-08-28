(function(context, undefined){

    var utils = require('../utils');

    var locations = require('./locations');

    var World = {
        Circumference : 24901.55,        //miles
        Degrees : 360,
        Locations : locations
    }

    console.log(World);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = World;
    } else {
        this.World = World;
    }
})(this);
