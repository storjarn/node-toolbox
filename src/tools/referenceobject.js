(function(context, undefined){

    var utils = require('node-toolbox/src/utils');

    var ReferenceObject = function(name, props){
        for(var key in props) {
            this[key] = props[key];
        }
        this.name = name;
        this.toData = function(){
            var ret = {};
            for(var key in this) {
                if (this.hasOwnProperty(key)) {
                    ret[key] = this[key];
                }
            }
            return ret;
        }
        this.valueOf = function() {
            return this.toData();
        }
        this.toJSON = function() {
            return this.toData();
        }
        return this;
    };

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = ReferenceObject;
    } else {
        this.ReferenceObject = ReferenceObject;
    }
})(this);
