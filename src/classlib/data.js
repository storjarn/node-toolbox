(function(undefined) {

    var Class = require('../class');

    /* public */
    var DataModel = Class.extend("DataModel", {
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

    });

    /* private */

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = DataModel;
    } else {
        this.DataModel = DataModel;
    }

})();
