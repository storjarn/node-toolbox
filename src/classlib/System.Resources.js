(function(context, exports, undefined){

   var System = require('./System')
    /*
          Resources
       */

    /* public */

    var Resources = new System.Namespace("Resources", System);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Resources;
    } else {
        // this.Resources = Resources;
    }

})(this);
