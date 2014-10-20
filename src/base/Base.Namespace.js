(function(undefined) {

    var utils = require('../utils');
    var Class = require('./Base.Class');

    /* public */
    // The base Namespace implementation (does nothing)
    var Namespace = function() {};

    var testing = null,
        initializing = false;

    var Namespace = Class.extend("Namespace", {
        init: function(name, parentNamespace, properties) {
            var self = this
            properties = properties || {};
            self.bind(properties);
            self.Name = name;
            self.ParentNamespace = parentNamespace;
            self.isNamespace = true;
            self.Type = Namespace;
            self.isClass = false;

            self.addClass = function(className, klass) {
                if (arguments.length == 1) {
                    klass = className;
                    className = klass.ClassName;
                }
                // klass.ClassName = className;
                if (self[className]) {
                    throw new Error("This class ('" + className + "') already exists in this namespace ('" + self.getFullyQualifiedName() + "')");
                }
                self[className] = registerClass(self, className, klass);

                klass.getFullyQualifiedName = function() {
                    return (self.ParentNamespace ? self.ParentNamespace.getFullyQualifiedName() + "." : "") + className;
                };

                return klass;
            };
            self.addNamespace = function(namespace) {
                // assertNamespace(namespace);
                if (self[namespace.Name])
                  throw new Error("The indicated namespace '" + namespace.Name + "' already exists in this namespace: '" + self.getFullyQualifiedName() + "'");
                self[namespace.Name] = namespace;
                namespace.ParentNamespace = self;
                return namespace;
            };

            self.getFullyQualifiedName = function() {
                return (self.ParentNamespace ? self.ParentNamespace.getFullyQualifiedName() + "." : "") + self.Name;
            };

            if (parentNamespace) {
                parentNamespace.addNamespace(self);
            }

            return self;
        }

    }, {
        isFinal : true
    });

    /* private */

    var registerClass = function(nameSpace, className, klass) {
        testing = nameSpace;
        assertNamespace(nameSpace);
        if (!className) throw new Error("You need to provide a class name as the second argument");
        testing = klass;
        assertClass(klass);

        klass.prototype.Type = klass;
        klass.prototype.ParentNamespace = klass.ParentNamespace = nameSpace;
        klass.ClassName = className;
        nameSpace[className] = klass;
        return klass;
    };


    var assertNamespace = function(namespace, error) {
        initializing = true;
        testing = namespace;
        //utils.assert(namespace && namespace instanceof Namespace && namespace.isNamespace, (error || "You need to provide a valid namespace."));
        initializing = false;
    };

    var assertClass = function(klass, error) {
        initializing = true;
        var instance = klass.prototype;
        testing = klass;
        utils.assert(klass && instance instanceof Class && klass.isClass, (error || "You need to provide a valid class. "));
        initializing = false;
    };

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Namespace;
    } else {
        this.Namespace = Namespace;
    }

})();
