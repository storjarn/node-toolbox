(function(context, undefined){

    // var utils = require('../utils');

    var Locations = {
        '35.8919224' : {
            '-106.2900411' : {
                Name        : 'Los Alamos, NM',
                WikiUrl     : "http://en.wikipedia.org/wiki/Los_Alamos,_New_Mexico",
                Elevation   : 7320   //ft
            }
        }
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Locations;
    } else {
        this.Locations = Locations;
    }
})(this);
