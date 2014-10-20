(function(undefined) {

    var System = require('./System')
    var Data = require('./Data')

    /* public */
    var Model = Data.addClass(
        System.Class.extend("Model", {
            init: function(query) {
                return this.fetch(query);
            },

            toData : function() {
                return {};
            },

            save: function(data){
                if (!!data) {

                } else {

                }
            },

            fetch: function(query) {
                return this;
            },

            delete: function() {
                return false;
            }
        })
    );

    /* private */

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Model;
    } else {
        // this.Model = Model;
    }

})();
