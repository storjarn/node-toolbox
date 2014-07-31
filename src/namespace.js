(function(undefined) {

    var utils = require('./utils');
    var Class = require('./class');

    /* public */
    // The base Namespace implementation (does nothing)
    var Namespace = function() {};

    var testing = null,
        initializing = false;

    Namespace = Class.extend("Namespace", {
      init: function(name, parentNamespace, properties) {
        properties = properties || {};
        this.bind(properties);
        this.Name = name;
        this.ParentNamespace = parentNamespace;
        this.isNamespace = true;
        this.Type = Namespace;
        this.isClass = false;
        parentNamespace && parentNamespace.addNamespace(this);

        this.addClass = function(className, klass) {
            if (arguments.length == 1) {
                klass = className;
                className = klass.ClassName;
            }
            // klass.ClassName = className;
            if (this[className]) throw new Error("This class ('" + className + "') already exists in this namespace ('" + this.getFullyQualifiedName() + "')");
            this[className] = registerClass(this, className, klass);

            klass.getFullyQualifiedName = function() {
                return (this.Namespace ? this.Namespace.getFullyQualifiedName() + "." : "") + className;
            };

            return klass;
          };
        this.addNamespace = function(namespace) {
            assertNamespace(namespace);
            if (this[namespace.Name])
              throw new Error("The indicated namespace '" + namespace.Name + "' already exists in this namespace: '" + this.getFullyQualifiedName() + "'");
            this[namespace.Name] = namespace;
            namespace.ParentNamespace = this;
            return namespace;
        };

        this.getFullyQualifiedName = function() {
            return (this.ParentNamespace ? this.ParentNamespace.getFullyQualifiedName() + "." : "") + this.Name;
        };

        return this;
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
      utils.assert(namespace && namespace instanceof Namespace && namespace.isNamespace, (error || "You need to provide a valid namespace."));
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
