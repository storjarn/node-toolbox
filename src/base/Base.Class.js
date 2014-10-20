/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(undefined){
    var utils = require('../utils');

    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\parent\b/ : /.*/;

    // The base Class implementation (does nothing)
    var Class = function(){};

    // Create a new Class that inherits from this class
    Class.extend = function(className, prop, staticProp) {
        staticProp = staticProp || {};

        var parent = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        var implement = function(prop, prototype, parent) {
            // Copy the properties over onto the new prototype
            for (var name in prop) {
                // Check if we're overwriting an existing function
                prototype[name] = typeof prop[name] == "function" &&
                typeof parent[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn){
                    return function() {
                        var tmp = this.parent;

                        // Add a new .parent() method that is the same method
                        // but on the super-class
                        this.parent = parent[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this.parent = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
            }
        }
        implement(prop, prototype, parent);

        var trackInstances = true;
        if (staticProp.trackInstances === false ||
            Class.prototype.trackInstances === false ||
            Class.trackInstances === false) {
            staticProp.trackInstances = trackInstances = false;
        } else {
            staticProp.trackInstances = trackInstances = true;
        }

        if (trackInstances) {
            Class.Instances = [];
        }

        var isFinal = staticProp.isFinal === true;

        function noop() {}

        // The dummy class constructor
        function Class() {
            if (!this.init) {
                this.init = noop
            }
            // All construction is actually done in the init method
            if ( !initializing && this.init )
                this.init.apply(this, arguments);

            if (!initializing && trackInstances) {
                Class.Instances.push(this);
            }
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        if (!isFinal) {
            Class.extend = arguments.callee;
        } else {
            Class.extend = function(){throw new Error("This class is marked as final and cannot be extended: " + Class.ClassName)}
        }

        Class.prototype.bind = utils.bind;
        Class.bind = utils.bind;
        Class.isClass = true;
        Class.implement = function(props) {
            Class.prototype.bind(props);
        }

        // Set our classname on the Type
        staticProp.ClassName = className || "Class";
        // Reference our super class on the Type
        staticProp.ParentType = this;
        // Set our static properties on the Type
        Class.bind(staticProp);
        Class.toString = function() {
            return "[Class " + className + "]";
        }

        // Reference our class as 'Type' on the instance.
        Class.prototype.Type = Class;
        // Compulsory toString method
        Class.prototype.toString = function() {
            return "[Object " + className + "]";
        }
        Class.prototype.toObject = function() {
            return JSON.parse(JSON.stringify(this, utils.censor(this)));
        }

        return Class;
    };

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Class;
    } else {
        this.Class = Class;
    }
})();
