(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":3,"_process":2,"inherits":1}],5:[function(require,module,exports){
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(undefined){
    var utils = require('./utils');

    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\parent\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function(){};

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

        // The dummy class constructor
        function Class() {
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

        //Added by cmaples

        Class.prototype.bind = utils.bind;
        Class.bind = utils.bind;
        Class.isClass = true;
        Class.implement = function(props) {
            Class.prototype.bind(props);
        }

        // Reference our class as 'Type' on the instance.
        Class.prototype.Type = Class;

        // Set our classname on the Type
        Class.ClassName = className || "Class";

        // Set our static properties on the Type
        Class.bind(staticProp);

        // Reference our super class on the Type
        Class.ParentType = this;

        // Compulsory toString method
        Class.prototype.toString = function() {
            return "[Class " + this.ClassName + "]";
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

},{"./utils":29}],6:[function(require,module,exports){
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

},{"../class":5}],7:[function(require,module,exports){
(function(context, undefined) {

    var Namespace = require('../namespace');
    var Class = require('../class');
    var EventEmitter = require('../eventemitter');
    var Utility = require('../utils');

    /*
         System
      */
    var ObjectTypes = [
      "Function", "Date", "Number", "String", "Array", "Object", "Boolean", "RegExp", "Math"
    ];

    var SuperTypes = [
      "undefined"
    ];

    var ErrorTypes = [
      "Error", "EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError"
    ];

    var NativeTypes = ObjectTypes.concat(SuperTypes, ErrorTypes);

    var Natives = {};

    for (var i = 0; i < NativeTypes.length; ++i) {
      var type = NativeTypes[i];
      Natives[type] = context[type];
    }

    if (Natives["undefined"] !== undefined) {
      Natives["undefined"] = undefined;
    }

    var System = new Namespace("System", null, {
        window: context.window,
        Class : Class,
        Namespace : Namespace,
        EventEmitter : EventEmitter
    });

    /* public static */
    Utility.merge(System, Natives);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = System;
    } else {
        this.System = System;
    }

})(this);

},{"../class":5,"../eventemitter":27,"../namespace":28,"../utils":29}],8:[function(require,module,exports){
(function(context, undefined){

   var Utility = require('./utility');

   /*
      Array (extensions)
   */

/* public static */
   Utility.merge(Array, {
   });

/* public */
   Utility.proto(Array, {
      insert : function(index) {
          index = Math.min(index, this.length);
          arguments.length > 1
              && this.splice.apply(this, [index, 0].concat([].pop.call(arguments)))
              && this.insert.apply(this, arguments);
          return this;
      },

      in : function(val) {
          for (var i = 0; i < array.length; ++i) {
              if (val == array[i]) return i;
          }
          return -1;
      }
   });

})(this);


},{"./utility":24}],9:[function(require,module,exports){
(function(context, undefined){

    var Utility = require('./utility');

   /*
      Type: Boolean (extensions)
   */

/* public static */
   Utility.merge(Boolean, {
      XOR : function(bool2){
         var a = Array.prototype.slice.call(arguments);
         if (a.length == 2) {
              var bool1 = a[0], bool2 = a[1];
              bool1 = bool1.valueOf(); bool2 = bool2.valueOf();
              return (bool1==true && bool2==false) || (bool2==true && bool1==false);
         } else { return null; }
       }
   });

/* public */
   Utility.proto(Boolean, {
   });

})(this);


},{"./utility":24}],10:[function(require,module,exports){
(function(undefined){

   var System = require('../system');

    var Collections = new System.Namespace("Collections", System);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Collections;
    } else {
        this.System = System;
    }

})();

},{"../system":7}],11:[function(require,module,exports){
(function(undefined){


    var System = require('../../system'),
        Collections = require('../collections');
   /*
      Type: Collections.LinkedList
   */
/* public */
   var LinkedList = Collections.addClass(
      System.Class.extend("LinkedList", {
         init : function() {
             var _head = null;
             var _tail = null;
             var _curr = null;
             var _count = 0;
             this.Head = function() { return _head; };
             this.Tail = function() { return _tail; };
             this.Current = function() { return _curr; };
             this.Next = function() { if (_curr) return _curr.Next; else return null; };
             this.Count = function() { return _count; };
             this.clear = function() { _count = 0; _head = _tail = _curr = null; };
             this.reset = function() { _curr = _head; };
             this.add = function(obj){
                  var item = new LinkedListItem(obj);
                  if (_curr === null) { _head = _tail = _curr = item;
                  } else if (_curr === _head) { _tail = _head.Next = item;
                  } else if (_curr === _tail) { _tail = _tail.Next = item;
                  } else {
                       var next = _curr.Next; item.Next = next;
                       /* _curr = */_curr.Next = item;
                  }
                  ++_count;
             };
             this.remove = function(obj) { //By value
                  var prev = null;
                  for (var ptr = _head; ptr != null; ptr = ptr.Next) {
                       if (obj == ptr.Value) {
                            var next = ptr.Next;
                            if (prev) {
                                 --_count; prev.Next = next;
                                 if (next == null) _tail = prev;
                            } else if (_count == 1) { this.clear(); } else {
                                 if (next) { _head = next; --_count; } //else { this.clear(); }
                            }
                       }
                       prev = ptr;
                  }
             };

        }
      })
   );

   var LinkedListItem = Collections.addClass(
      System.Class.extend("LinkedListItem", {
         init : function(val){  this.Value = val || null; this.Next = null; }
      })
   )

/* public */

})();


},{"../../system":7,"../collections":10}],12:[function(require,module,exports){
(function(context, undefined){

    var Utility = require('./utility');
   /*
      Type: Date (extensions)
   */

/* public static */
   Utility.merge(Date, {
      Formats : {
         DefaultDateTime : "#MMMM# #DD#, #YYYY# T#hh#:#mm#:#ss#:#msm#",
         DefaultDate : "#MMMM# #DD#, #YYYY#",
         DefaultTime : "#hh#:#mm#:#ss#:#msm#",
         ISODateTime : "#YYYY#-#MM#-#DD# T#hh#:#mm#:#ss#:#msm#",
         ISODate : "#YYYY#-#MM#-#DD#",
         ISOTime : "#hh#:#mm#:#ss#:#msm#"
       },
      format : function(){
         var a = Array.prototype.slice.call(arguments);
         if (a.length > 0) {
              var date = a[0];
              var formatString = (a.length == 2) ? a[1] : DateExtensions.Formats.Custom.Default;
              var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhh,hh,h,mm,m,ss,s,ms,msm,ampm,dMod,th;
              YY = ((YYYY=date.getFullYear())+"").substr(2,2);
              MM = (M=date.getMonth()+1)<10?('0'+M):M;
              MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substr(0,3);
              DD = (D=date.getDate())<10?('0'+D):D;
              DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][date.getDay()]).substr(0,3);
              th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
              formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);

              h=(hhh=date.getHours());
              if (h == 0) h = 24;
              if (h>12) h -= 12;
              hh = h<10?('0'+h):h;
              ampm=hhh<12?'am':'pm';
              mm=(m=date.getMinutes())<10?('0'+m):m;
              ss=(s=date.getSeconds())<10?('0'+s):s;
              msm=(ms=date.getMilliseconds())<10?('00'+ms):(ms=date.getMilliseconds())<100?('0'+ms):ms;
              return formatString.replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#ms#", ms).replace("#msm#", msm);
         } else { return null; }
      }
   });

/* public */

})(this);


},{"./utility":24}],13:[function(require,module,exports){
(function(context, undefined){

    var Utility = require('./utility');
    var Class = require('../../class')

   /*
      Type: Error (extensions)
   */

/* public */
   TimeStampedError = Class.extend({
      init : function(msg, num, src) {
         this.TimeStamp = new Date();
         var err;

         if (arguments.length && arguments[0] instanceof Error) {
            err = arguments[0];
            msg = err.message;
            num = err.number;
            src = err.source ? err.source : src;
         } else {
            err = new Error(num || -1, (msg || ""));
            if (src) err.source = src;
         }

         var errorCode = err.number ? "Error Code " + err.number : "";
         var tmsg = "[" + this.TimeStamp.toLocaleString() + "] " + errorCode + err.message;

         this.number = num;
         this.source = src;
         this.message = msg;
         this.Error = err;

         this.toString = function() { return tmsg; };
      }
   });

/* public static */
   Utility.merge(Error, {
   });



/* public */
   Utility.proto(Error, {
   });

   /*
   EvalError   An error in the eval() function has occurred.
   RangeError  Out of range number value has occurred.
   ReferenceError An illegal reference has occurred.
   SyntaxError A syntax error within code inside the eval() function has occurred. All other syntax errors are not caught by try/catch/finally, and will trigger the default browser error message associated with the error. To catch actual syntax errors, you may use the onerror event.
   TypeError   An error in the expected variable type has occurred.
   URIError An error when encoding or decoding the URI has occurred (ie: when calling encodeURI()).

   Error types
   Besides the generic Error constructor, there are six other core error constructors in JavaScript. For client-side exceptions, see Exception Handling Statements.
   EvalError
   Creates an instance representing an error that occurs regarding the global function eval()
   RangeError
   Creates an instance representing an error that occurs when a numeric variable or parameter is outside of its valid range
   ReferenceError
   Creates an instance representing an error that occurs when de-referencing an invalid reference
   SyntaxError
   Creates an instance representing a syntax error that occurs while parsing code in eval()
   TypeError
   Creates an instance representing an error that occurs when a variable or parameter is not of a valid type
   URIError
   Creates an instance representing an error that occurs when encodeURI() or decodeURI() are passed invalid parameters

   Error.prototype
   TABLE OF CONTENTS
   Summary
   Description
   Properties
   Standard properties
   Vendor-specific extensions
   Microsoft
   Mozilla
   Methods
   See also
   TAGS FILES
   Summary
   Represents the prototype for the Error constructor.

   Description
   All Error instances and instances of non-generic errors inherit from Error.prototype. As with all constructor functions, you can use the prototype of the constructor to add properties or methods to all instances created with that constructor.

   Properties
   Standard properties
   constructor
   Specifies the function that created an instance's prototype.
   message
   Error message.
   name
   Error name.
   Vendor-specific extensions

   Non-standard
   This feature is non-standard and is not on a standards track. Do not use it on production sites facing the Web: it will not work for every user. There may also be large incompatibilities between implementations and the behavior may change in the future.

   Microsoft
   description
   Error description. Similar to message.
   number
   Error number.

   Mozilla
   fileName
   Path to file that raised this error.
   lineNumber
   Line number in file that raised this error.
   columnNumber
   Column number in line that raised this error.
   stack
   Stack trace.

   Methods
   toSource
   Returns a string containing the source of the specified Error object; you can use this value to create a new object. Overrides the Object.toSource method.
   toString
   Returns a string representing the specified object. Overrides the Object.toString method.

   */

})(this);


},{"../../class":5,"./utility":24}],14:[function(require,module,exports){
(function(context, undefined){

    var Utility = require('./utility');

   /*
      Type: Function (extensions)
   */

/* public static */
   Utility.merge(Function, {
      /*
          Returns a function that can be called with a context and some values preset .
          Handy for reuse of coupled logic patterns.
          var fn_adder = function(num, add){
              return num + add;
          };
          var add1 = curryFunction(fn_adder, null, 1);
          var add5 = curryFunction(fn_adder, null, 5);
          var sub2 = curryFunction(fn_adder, null, -2);

          var n_5 = add1(4);      // = 5
          var n_3 = sub2(n_5);    // = 3
          var n_8 = add5(n_3);    // = 8

      */
      curry : function(fn, scope) {
         fn = fn || function(){ return arguments.slice(); };
         var scope = scope || window || null;
         var args = [];
         //Skips the first two arguments and gets what becomes the preset first group of arguments on the resulting function.
         for (var i=2, len = arguments.length; i < len; ++i) {
           args.push(arguments[i]);
         };
         return function() {
            // Convert any arguments passed to the this function into an array.
            // This time we want them all
            var args2 = [];
            for (var i = 0; i < arguments.length; i++) {
               args.push(arguments[i]);
            }

            // Here we combine any args originally passed to curry, with the args
            // passed directly to this function.
            //   curry(fn, scope, a, b)(c, d)
            // would set argstotal = [a, b, c, d]
            var argstotal = args.concat(args2);

            return fn.apply(scope, argstotal);
         };
      }
   });

/* public */
   Utility.proto(Function, {
   });

})(this);


},{"./utility":24}],15:[function(require,module,exports){
(function(context, undefined){

    var Utility = require('./utility');
    var Namespace = require('../../namespace')
    var System = require('../system')

   /*
      System.Input
   */

/* public */
   var Input = new Namespace("Input", System);


   /*
      System.Input.KeyCode
   */

/* public static */
   new Namespace("KeyCode", Input, {
      Backspace : 8, Tab    : 9, Enter : 13, Shift : 16, Ctrl : 17, Alt : 18, Pause : 19,
      Break : 19, CapsLock : 20, Escape : 27, Space : 32, PageUp : 33, PageDown : 34,
      End : 35, Home : 36, Left : 37, Up : 38, Right : 39, Down : 40, PrintScreen : 44,
      Insert : 45, Delete : 46,
      '0' : 48, '1' : 49, '2' : 50, '3' : 51, '4' : 52, '5' : 53, '6' : 54, '7' : 55,
      '8' : 56, '9' : 57, 'a' : 65, 'b' : 66, 'c' : 67, 'd' : 68, 'e' : 69, 'f' : 70,
      'g' : 71, 'h' : 72, 'i' : 73, 'j' : 74, 'k' : 75, 'l' : 76, 'm' : 77, 'n' : 78,
      'o' : 79, 'p' : 80, 'q' : 81, 'r' : 82, 's' : 83, 't' : 84, 'u' : 85, 'v' : 86,
      'w' : 87, 'x' : 88, 'y' : 89, 'z' : 90,
      LeftWindow : 91, RightWindow : 92, Select : 93, Numpad0 : 96, Numpad1 : 97,
      Numpad2 : 98, Numpad3 : 99, Numpad4 : 100, Numpad5 : 101, Numpad6 : 102,
      Numpad7 : 103, Numpad8 : 104, Numpad9 : 105, Multiply : 106, Add : 107,
      Subtract : 109, DecimalPoint : 110, Divide : 111, F1 : 112, F2 : 113,
      F3 : 114, F4 : 115, F5 : 116, F6 : 117, F7 : 118, F8 : 119, F9 : 120,
      F10 : 121, F11 : 122, F12 : 123, NumLock : 144, ScrollLock : 145,
      MyComputer : 182,   //(multimedia keyboard)
      MyCalculator : 183,      //(multimedia keyboard)
      Semicolon : 186, Equals : 187, Comma : 188, Dash : 189, Period : 190,
      ForwardSlash : 191, GraveAccent : 192, OpenBracket : 219, BackSlash : 220,
      CloseBraket : 221, SingleQuote : 222
   });

/* public */

})(this);


},{"../../namespace":28,"../system":7,"./utility":24}],16:[function(require,module,exports){
(function(context, undefined){

    var Utility = require('./utility');

   /*
      Type: Math (extensions)
   */

/* public static */
   Utility.merge(Math, {
      round : function(){
        var _round = Math.round;
         var a = Array.prototype.slice.call(arguments);
         if (a.length > 0) {
              var num = a[0];
              if (a.length > 1) var decimals = a[1];
              if (a.length > 2) var returnAsString = a[2];
              if (a.length > 3) var decimalSeparator = a[3];
              //Supports 'negative' decimals, e.g. myNumber.round(-3) rounds to the nearest thousand
              var n,factor,breakPoint,whole,frac;
              if (!decimals) decimals=0;
              factor=Math.pow(10,decimals);
              n=(num.valueOf()+String.Empty);         //To get the internal value of an Object, use the valueOf() method
              if (!returnAsString) return _round(n*factor)/factor;
              if (!decimalSeparator) decimalSeparator=".";
              if (n==0) return "0."+((factor+String.Empty).substr(1));
              breakPoint=(n=_round(n*factor)+String.Empty).length-decimals;
              whole = n.substr(0,breakPoint);
              if (decimals > 0){
                   frac = n.substr(breakPoint);
                   if (frac.length<decimals) frac=(Math.pow(10,decimals-frac.length)+String.Empty).substr(1)+frac;
                   return whole+decimalSeparator+frac;
              } else return whole+((Math.pow(10,-decimals)+String.Empty).substr(1));
         } else { return null; }
       }
   });

/* public */

})(this);


},{"./utility":24}],17:[function(require,module,exports){
(function(context, undefined){

    var Utility = require('./utility');

   /*
      Type: Number (extensions)
   */

/* public static */
   Utility.merge(Number, {
       toCurrency : function(){
            var a = Array.prototype.slice.call(arguments);
            if (a.length > 0) {
                 var num = a[0];
                 if (a.length > 1) var noFractions = a[1];
                 if (a.length > 2) var currencySymbol = a[2];
                 if (a.length > 3) var decimalSeparator = a[3];
                 if (a.length > 4) var thousandsSeparator = a[4];
                 var n,startAt,intLen;
                 if (currencySymbol==null) currencySymbol="$";
                 if (decimalSeparator==null) decimalSeparator=".";
                 if (thousandsSeparator==null) thousandsSeparator=",";
                 n = num.round(noFractions?0:2,true,decimalSeparator);
                 intLen=n.length-(noFractions?0:3);
                 if ((startAt=intLen%3)==0) startAt=3;
                 for (var i=0,len=Math.ceil(intLen/3)-1;i<len;i++)n=n.insertAt(i*4+startAt,thousandsSeparator);
                 return currencySymbol+n;
            } else { return null; }
       },
       toInteger : function(){
            var a = Array.prototype.slice.call(arguments);
            if (a.length > 0) {
                 var num = a[0];
                 if (a.length == 2) var thousandsSeparator = a[1];
                 var n,startAt,intLen;
                 if (thousandsSeparator==null) thousandsSeparator=",";
                 n = num.round(0,true);
                 intLen=n.length;
                 if ((startAt=intLen%3)==0) startAt=3;
                 for (var i=0,len=Math.ceil(intLen/3)-1;i<len;i++)n=n.insertAt(i*4+startAt,thousandsSeparator);
                 return n;
            } else {return null; }
       }
   });

})(this);

},{"./utility":24}],18:[function(require,module,exports){
(function(context, exports, undefined){

   var System = require('../system'),
      Namespace = require('../../namespace');

    /*
          Resources
       */

    /* public */

    var Resources = new Namespace("Resources", System);


    /*
          Resources.Strings
       */

    /* public */

    var CHARMAP_Num = "0123456789",
      CHARMAP_Alpha_Upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      CHARMAP_Alpha_Lower = CHARMAP_Alpha_Upper.toLowerCase(),
      CHARMAP_ExtraChars = "`~!@#$%^&()_+=-';.,][}{",
      CHARMAP_SpecialChars = "*\"|:/?><\\",
      CHARMAP_AllChars = CHARMAP_Num.concat(CHARMAP_Num, CHARMAP_Alpha_Upper,
        CHARMAP_Alpha_Lower, CHARMAP_ExtraChars, CHARMAP_SpecialChars);

    var Strings = new Namespace("Strings", Resources);

    Strings.bind({
      //Native Type Names
      Math: "Math",
      Boolean: "Boolean",
      Date: "Date",
      Array: "Array",
      String: "String",
      Number: "Number",
      Function: "Function",
      Error: "Error",
      VBArray: "VBArray",
      RegExp: "RegExp",
      Enumerator: "Enumerator",
      ActiveXObject: "ActiveXObject",
      Null: 'null',
      Undefined: "undefined",
      TypeError: "TypeError",
      SyntaxError: "SyntaxError",
      RangeError: "RangeError",
      EvalError: "EvalError",
      ReferenceError: "ReferenceError",
      URIError: "URIError",
      //Formatted strings
      EvalReturnScopedValue: '(function(){return {0};})()',
      KeyValuePair: "{0} : {1}",
      TimeStampedMessage: '[{0}]  {1}',
      EchoCmdLine: 'echo {0}',
      ExecCOMSPEC: "%COMSPEC% /c {0}",
      EvalExceptions: "\n****evaling - \n{0}\n{1}\n{2}",
      isXXX: "is{0}",
      hasXXX: 'has{0}',
      ThreeItemsContiguous: "{0}{1}{2}",
      TimeFormat: "{0}:{1}:{2}:{3}",
      TwoItemsContiguous: "{0}{1}",
      //Useful characters and bits
      Semicolon: ";",
      Colon: ":",
      Empty: "",
      NewLine: "\n",
      Space: " ",
      Dot: ".",
      DirectorySeparator: '\\',
      WebSeparator: '/',
      //Character maps
      CHARMAP_Num: CHARMAP_Num,
      CHARMAP_Alpha_Upper: CHARMAP_Alpha_Upper,
      CHARMAP_Alpha_Lower: CHARMAP_Alpha_Lower,
      CHARMAP_AlphaNum: CHARMAP_Alpha_Lower + CHARMAP_Num + CHARMAP_Alpha_Upper,
      CHARMAP_AllChars: CHARMAP_AllChars,
      CHARMAP_ExtraChars: CHARMAP_ExtraChars,
      CHARMAP_SpecialChars: CHARMAP_SpecialChars,
      //General strings
      DefaultPropertyName: "Unnamed Property"
    });

    System.Utility.merge(System.String, {
      Empty: Strings.Empty,
      NewLine: Strings.NewLine,
      Space: Strings.Space,
      Dot: Strings.Dot,
      DirSep: Strings.DirectorySeparator,
      WebSep: Strings.WebSeparator,
    });


    /*
          Resources.Integers
       */

    /* public */

    var Integers = new Namespace("Integers", Resources);
    Integers.bind({
      MsPerSecond: 1000,
      MsPerMinute: 1000 * 60,
      MsPerHour: 1000 * 60 * 60,
      MsPerDay: 1000 * 60 * 60 * 24,
      SecsPerMinute: 60,
      SecsPerHour: 60 * 60,
      SecsPerDay: 60 * 60 * 24,
      MinsPerHour: 60,
      MinsPerDay: 60 * 24,
      HoursPerDay: 24,
      HoursPerWeek: 24 * 7,
      DaysPerWeek: 7,
      MonthsPerYear: 12,
      YearsPerCentury: 100
    });

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Resources;
    } else {
        this.System = System;
    }

})(this);

},{"../../namespace":28,"../system":7}],19:[function(require,module,exports){
(function(context, undefined){

    var Utility = require('./utility');
    var Resources = require('./resources')
    
   /*
      Type: String (extensions)
   */

   var Strings = Resources.Strings;

/* public static */
   Utility.merge(String, {
      //Static properties
      Empty : String.Empty,
      NewLine : String.NewLine,
      Space : String.Space,
      //Static functions
      trim : function() {          //Defaults to whitespace and false
         var a = Array.prototype.slice.call(arguments);
         if (a.length == 0) return "";
         if (a.length == 1) //http://blog.stevenlevithan.com/archives/faster-trim-javascript
              return a[0].replace(/^\s\s*/, String.Empty)
                   .replace(/\s\s*$/, String.Empty);
         if (a.length > 1) { //we have something other than whitespace to trim
              var str = a[0], find = a[1];
              if (a.length > 2) var bCase = a[2];
              var ret = str.slice();
              var regex = function(sfind) {
                   return !!sfind
                        ? new RegExp("^("+sfind+")+|("+sfind+")+$", (!bCase ? "i" : String.Empty) + "g")
                        : !bCase ? /^\s+|\s+$/ig : /^\s+|\s+$/g ;
              };
              if (typeof(find) == "array")
                   for(var find1 in find)
                        ret = ret.replace( regex(find[find1]), String.Empty );
              else ret = ret.replace( regex(find), String.Empty );
              return ret;
         }
      },
      clean: function(str){
            return this.trim((str || "").toString().replace(/\s+/g, ' '));
        },
      random : function(len, useExtraChars) {
          len = len || 50;
         var chars = Strings.CHARMAP_AlphaNum.toString(), ret = String.Empty;
         if (useExtraChars) chars = Strings.CHARMAP_ExtraChars.toString().concat( chars );
         for (var i=0; i<len; ++i) {
            var rnum = Utility.getRandomizer(0, chars.length-1)();
            ret = String.format(Strings.TwoItemsContiguous, ret, chars.substring(rnum,rnum+1));
         }
         return ret;
      },
      capitalize : function() {
         var a = Array.prototype.slice.call(arguments);
         return a.length
              ? a[0].replace(/^\w/, function($0) { return $0.toUpperCase(); })
              : null;
      },
      format : function(){     //Just like String.Format(string, args) in C#
         var a = Array.prototype.slice.call(arguments);
         if (a.length > 1) {
              var args = a.slice(1);
              return a[0].replace(/\{(\d+)\}/g, function($0, $1){ return args[parseInt($1)]; });
         } else { return null; }
      },
      insertAt : function() {
         var a = Array.prototype.slice.call(arguments);
         if (a.length == 3) {
              var str = a[0], loc = a[1], chunk = a[2];
              return [
                   str.valueOf().substr(0,loc),
                   chunk,
                   str.valueOf().substr(loc)
              ].join();
         } else { return null; }
      },
      toCharArray : function(){
         var a = Array.prototype.slice.call(arguments);
         if (a.length == 1) {
              return a[0].split(String.Empty);
         } else { return null; }
      }
   });

/* public */
   Utility.proto(String, {
      trim : function(find, bCase){ return String.trim(this, find, bCase); },
      capitalize : function(){
          return this.length > 1
              ? this.charAt(0).toUpperCase() + this.slice(1)
              : this.charAt(0).toUpperCase();
      },
      format : function(args){
          var args = arguments;
          return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                  ? args[number]
                  : match
            ;
          });
      },
      insertAt : function(index, chunk) {
        if (index > 0)
          return this.substring(0, index) + chunk + this.substring(index, this.length);
        else
          return chunk + this;
      },
      //toCharArray : function() { return String.toCharArray(this); }
      startsWith : function (str, caseSensitive){
          caseSensitive = caseSensitive || false;
          return caseSensitive
                  ?
                  this.slice(0, str.length) == str
                  :
                  this.slice(0, str.length).toLowerCase() == str.toLowerCase();
      },
      endsWith : function (str, caseSensitive){
          caseSensitive = caseSensitive || false;
          return caseSensitive
                  ?
                  this.slice(-str.length) == str
                  :
                  this.slice(-str.length).toLowerCase() == str.toLowerCase();
      }
   });

})(this);

},{"./resources":18,"./utility":24}],20:[function(require,module,exports){
(function(undefined){

   var Namespace = require('../../namespace');
   var System = require('../system');

    var Threading = new Namespace("Threading", System);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Threading;
    } else {
        this.System = System;
    }

})();

},{"../../namespace":28,"../system":7}],21:[function(require,module,exports){
(function(undefined){

    var Threading = require('../threading'),
        System = require('../../system')

   /*
      Type: Pattern

      It is often the case that you want to execute a bit of code if some condition is met in the future. This is exactly the use case for sometimeWhen.

      A representative example for sometimeWhen is testing for when some set of asynchronous operations have all completed. In the following example, getUrl performs a simple GET request, and getUrlsInBatch will take a list of URLs and a callback to call once all the URLs' request data has been received.

        function getUrlsInBatch (urls, callback) {
            var results = [],
              sometimeWhen = new SometimeWhen();

            for (var i = 0; i < urls.length; i++) {
                getUrl(urls[i], function (data) {
                    results.push(data);
                });
            }

            // When the length of the results and urls are equal, that means every
            // request has completed and we can call the callback with all of the
            // requested data.
            sometimeWhen.exec(
               function () { return results.length === urls.length; },
               function () {
                   callback(results);
               }
            );
        }
   */

/* public */
    var SometimeWhen = Threading.addClass(
      System.Class.extend("SometimeWhen", {
        init : function() {
        },
        exec : function (test, then) {
            System.Utility.thread(function () {
                if ( test() ) {
                    then();
                } else {
                    System.Utility.thread(arguments.callee);
                }
            });
        }
     })
   );


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = SometimeWhen;
    } else {
        this.System = System;
    }

})();




},{"../../system":7,"../threading":20}],22:[function(require,module,exports){
(function(undefined){

    var Threading = require('../threading'),
        System = require('../../system')

   /*
      Type: Pattern

      It is often the case that you want to execute a bit of code if some condition is met in the future. This is exactly the use case for sometimeWhen.

      A representative example for sometimeWhen is testing for when some set of asynchronous operations have all completed. In the following example, getUrl performs a simple GET request, and getUrlsInBatch will take a list of URLs and a callback to call once all the URLs' request data has been received.

        function getUrlsInBatch (urls, callback) {
            var results = [],
              sometimeWhen = new SometimeWhen();

            for (var i = 0; i < urls.length; i++) {
                getUrl(urls[i], function (data) {
                    results.push(data);
                });
            }

            // When the length of the results and urls are equal, that means every
            // request has completed and we can call the callback with all of the
            // requested data.
            sometimeWhen.exec(
               function () { return results.length === urls.length; },
               function () {
                   callback(results);
               }
            );
        }
   */

/* public */
    var Whenever = Threading.addClass(
      System.Class.extend("Whenever", {
        init : function() {
        },
        exec : function  (test, then) {
            var sometimeWhen = new Threading.SometimeWhen();
            sometimeWhen.exec(test, function () {
                then();
                sometimeWhen.exec(test, arguments.callee);
            });
        }
     })
   );


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Whenever;
    } else {
        this.System = System;
    }

})();




},{"../../system":7,"../threading":20}],23:[function(require,module,exports){
(function(undefined){

    var Threading = require('../threading'),
        System = require('../../system'),
        Namespace = require('../../../namespace');

   /*
      Type: Pattern

      It is often the case that you want to execute a bit of code if some condition is met in the future. This is exactly the use case for sometimeWhen.

      A representative example for sometimeWhen is testing for when some set of asynchronous operations have all completed. In the following example, getUrl performs a simple GET request, and getUrlsInBatch will take a list of URLs and a callback to call once all the URLs' request data has been received.

        function getUrlsInBatch (urls, callback) {
            var results = [],
              sometimeWhen = new SometimeWhen();

            for (var i = 0; i < urls.length; i++) {
                getUrl(urls[i], function (data) {
                    results.push(data);
                });
            }

            // When the length of the results and urls are equal, that means every
            // request has completed and we can call the callback with all of the
            // requested data.
            sometimeWhen.exec(
               function () { return results.length === urls.length; },
               function () {
                   callback(results);
               }
            );
        }
   */

/* public */
    var YieldingEach = Threading.addClass(
      System.Class.extend("YieldingEach", {
        init : function() {
        },
        exec : function  (items, iterFn, callback) {
            var i = 0, len = items.length;
            System.Utility.thread(function () {
                var result;

                // Process the items in batch for 50 ms, or while the result of
                // calling `iterFn` on the current item is not false..
                for ( var start = +new Date;
                      i < len && result !== false && ((+new Date) - start < 50);
                      i++ ) {
                    result = iterFn.call(items[i], items[i], i);
                }

                // When the 50ms is up, let the UI thread update by defering the
                // rest of the iteration with `async`.
                if ( i < len && result !== false ) {
                    System.Utility.thread(arguments.callee);
                } else {
                    callback(items);
                }
            });
        }
     })
   );


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = YieldingEach;
    } else {
        this.System = System;
    }

})();




},{"../../../namespace":28,"../../system":7,"../threading":20}],24:[function(require,module,exports){
(function(undefined){

   var Namespace = require('../../namespace');
   var System = require('../system');
   var utils = require('../../utils');

    var Utility = new Namespace("Utility", System, utils);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Utility;
    } else {
        this.System = System;
    }

})();

},{"../../namespace":28,"../../utils":29,"../system":7}],25:[function(require,module,exports){
(function(undefined){

   var Namespace = require('../namespace');

    var Web = new Namespace("Web");

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Web;
    } else {
        this.Web = Web;
    }

})();

},{"../namespace":28}],26:[function(require,module,exports){
/*

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return Cookies; });
    // CommonJS and Node.js module support.
    } else if (typeof exports !== 'undefined') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Cookies;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = Cookies;
    } else {
        window.Cookies = Cookies;
    }

*/

(function(undefined){

   var System = require('../system');
    var Web = require("../web");

   /*
      CookieManager
      based on Cookies.js 0.3.1, Copyright (c) 2013, Scott Hamper
   */

/* public */

   var CookieManager = Web.addClass(
      System.Class.extend("CookieManager", {
         enabled : false,
         defaults : {
            path: '/',
            domain: '',
            expires: '0',
            secure: ''
         },
         _document : null,
         _navigator : null,
         _cache : {},
         init : function () {
            // Allows for setter injection in unit tests
            this._document = undefined != context.document ? document : null;
            this._navigator = undefined != context.navigator ? navigator : null;

            this._getExtendedOptions({});

            this.enabled = this._areEnabled();
        },

        get : function (key) {
            if (!!this._document && this._cachedDocumentCookie !== this._document.cookie) {
                this._renewCache();
            }

            return this._cache[key];
        },

        set : function (key, value, options) {
            options = this._getExtendedOptions(options);
            options.expires = this._getExpiresDate(value === undefined ? -1 : options.expires);

            if (!!this._document) {
                this._document.cookie = this._generateCookieString(key, value, options);
            }

            return this;
        },

        expire : function (key, options) {
            return this.set(key, undefined, options);
        },

        _getExtendedOptions : function (options) {
            return {
                path: options && options.path || this.defaults.path,
                domain: options && options.domain || this.defaults.domain,
                expires: options && options.expires || this.defaults.expires,
                secure: options && options.secure !== undefined ?  options.secure : this.defaults.secure
            };
        },

        _isValidDate : function (date) {
            return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
        },

        _getExpiresDate : function (expires, now) {
            now = now || new Date();
            switch (typeof expires) {
                case 'number': expires = new Date(now.getTime() + expires * 1000); break;
                case 'string': expires = new Date(expires); break;
            }

            if (expires && !this._isValidDate(expires)) {
                throw new Error('`expires` parameter cannot be converted to a valid Date instance');
            }

            return expires;
        },

        _generateCookieString : function (key, value, options) {
            key = encodeURIComponent(key);
            value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
            options = options || {};

            var cookieString = key + '=' + value;
            cookieString += options.path ? ';path=' + options.path : '';
            cookieString += options.domain ? ';domain=' + options.domain : '';
            cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
            cookieString += options.secure ? ';secure' : '';

            return cookieString;
        },

        _getCookieObjectFromString : function (documentCookie) {
            var cookieObject = {};
            var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

            for (var i = 0; i < cookiesArray.length; i++) {
                var cookieKvp = this._getKeyValuePairFromCookieString(cookiesArray[i]);

                if (cookieObject[cookieKvp.key] === undefined) {
                    cookieObject[cookieKvp.key] = cookieKvp.value;
                }
            }

            return cookieObject;
        },

        _getKeyValuePairFromCookieString : function (cookieString) {
            // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
            var separatorIndex = cookieString.indexOf('=');

            // IE omits the "=" when the cookie value is an empty string
            separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

            return {
                key: decodeURIComponent(cookieString.substr(0, separatorIndex)),
                value: decodeURIComponent(cookieString.substr(separatorIndex + 1))
            };
        },

        _renewCache : function () {
            if (!!this._document) {
                this._cache = this._getCookieObjectFromString(this._document.cookie);
                this._cachedDocumentCookie = this._document.cookie;
            }
        },

        _areEnabled : function () {
            return this.set('cookies.js', 1).get('cookies.js') === '1';
        }
      })
   );

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = CookieManager;
    } else {
        this.System = System;
    }

})();

},{"../system":7,"../web":25}],27:[function(require,module,exports){
(function(){

    var Class = require('./class');

    var EventEmitter = Class.extend("EventEmitter", {

        init : function(){
            //parent() being called the old school way.
            this.parent.apply(this, arguments);
        },

        _maxListeners : 10,

        // Bind an event to a `callback` function. Passing `"all"` will bind
        // the callback to all events fired.
        on: function(name, callback, context) {
            if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
            this._events || (this._events = {});
            var events = this._events[name] || (this._events[name] = []);
            var evt = {callback: callback, context: context, ctx: context || this};
            if (this._maxListeners == 0 || events.length < this._maxListeners) {
                events.push(evt);
                this._events[name] = events;
            } else {
                throw new Error('This EventEmitter has already reached the maximum number of listeners!');
            }
            this.emit('newListener', evt);
            return this;
        },

        addListener : function() {
            return this.on.apply(this, arguments);
        },

        // Bind an event to only be triggered a single time. After the first time
        // the callback is invoked, it will be removed.
        once: function(name, callback, context) {
            if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
            var self = this;
            var once = _.once(function() {
              self.off(name, once);
              callback.apply(this, arguments);
            });
            once._callback = callback;
            return this.on(name, once, context);
        },

        // Remove one or many callbacks. If `context` is null, removes all
        // callbacks with that function. If `callback` is null, removes all
        // callbacks for the event. If `name` is null, removes all bound
        // callbacks for all events.
        off: function(name, callback, context) {
            var retain, ev, events, names, i, l, j, k;
            if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
            if (!name && !callback && !context) {
              this._events = {};
              return this;
            }
            names = name ? [name] : _.keys(this._events);
            for (i = 0, l = names.length; i < l; i++) {
              name = names[i];
              if (events = this._events[name]) {
                this._events[name] = retain = [];
                if (callback || context) {
                  for (j = 0, k = events.length; j < k; j++) {
                    ev = events[j];
                    if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                        (context && context !== ev.context)) {
                      retain.push(ev);
                    }
                  }
                }
                if (!retain.length) delete this._events[name];
              }
            }

            this.emit('removeListener');

            return this;
        },

        removeListener : function() {
            return this.off.apply(this, arguments);
        },

        // Trigger one or many events, firing all bound callbacks. Callbacks are
        // passed the same arguments as `trigger` is, apart from the event name
        // (unless you're listening on `"all"`, which will cause your callback to
        // receive the true name of the event as the first argument).
        trigger: function(name) {
            if (!this._events) return this;
            var args = Array.prototype.slice.call(arguments, 1);
            if (!eventsApi(this, 'trigger', name, args)) return this;
            var events = this._events[name];
            var allEvents = this._events.all;
            if (events) triggerEvents(events, args);
            if (allEvents) triggerEvents(allEvents, arguments);
            return this;
        },

        emit : function() {
            return this.trigger.apply(this, arguments);
        },

        removeAllListeners : function(name) {
            if (!this._events) return this;
            delete this['_events'];
            return this;
        },

        // Tell this object to stop listening to either specific events ... or
        // to every object it's currently listening to.
        stopListening: function(obj, name, callback) {
            var listeningTo = this._listeningTo;
            if (!listeningTo) return this;
            var remove = !name && !callback;
            if (!callback && typeof name === 'object') callback = this;
            if (obj) (listeningTo = {})[obj._listenId] = obj;
            for (var id in listeningTo) {
                obj = listeningTo[id];
                obj.off(name, callback, this);
                if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
            }
            return this;
        },

        setMaxListeners : function(n) {
            this._maxListeners = n;
        },

        listeners : function(eventName) {
            if (!this._events) return [];
            if (!this._events[name]) return [];
            return this._events[name];
        }

    }, {
        listenerCount: function(emitter, eventName) {
            if (!emitter._events) return 0;
            if (emitter._events[eventName] && emitter._events[eventName].length)
                return emitter._events[eventName].length;
            return 0;
        }
    });

    var extend = EventEmitter.extend;

    EventEmitter.extend = function() {
        var _class = extend.apply(this, arguments);

        if (!_class.isFinal) {
            _class.extend = arguments.callee;
        } else {
            _class.extend = function(){throw new Error("This class is marked as final and cannot be extended: " + _class.ClassName)}
        }

        if (!_class.on) {
            _class.on = function(eventName, callback){
                _class.prototype.on(eventName, callback);
            }
        }

        if (!_class.fireEvent) {
            _class.fireEvent = function(eventName, args){
                if (_class.trackInstances) {
                    for(var i = 0; i < _class.Instances.length; ++i) {
                        _class.Instances[i].emit.apply(
                            _class.Instances[i], [eventName].concat(args)
                        );
                    }
                }
            }
        }

        return _class;
    }

    // Regular expression used to split event strings.
    var eventSplitter = /\s+/;

    // Implement fancy features of the Events API such as multiple event
    // names `"change blur"` and jQuery-style event maps `{change: action}`
    // in terms of the existing API.
    var eventsApi = function(obj, action, name, rest) {
      if (!name) return true;

      // Handle event maps.
      if (typeof name === 'object') {
        for (var key in name) {
          obj[action].apply(obj, [key, name[key]].concat(rest));
        }
        return false;
      }

      // Handle space separated event names.
      if (eventSplitter.test(name)) {
        var names = name.split(eventSplitter);
        for (var i = 0, l = names.length; i < l; i++) {
          obj[action].apply(obj, [names[i]].concat(rest));
        }
        return false;
      }

      return true;
    };

    // A difficult-to-believe, but optimized internal dispatch function for
    // triggering events. Tries to keep the usual cases speedy (most internal
    // Backbone events have 3 arguments).
    var triggerEvents = function(events, args) {
      var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
      switch (args.length) {
        case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
        case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
        case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
        case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
        default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
      }
    };

    var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

    // Inversion-of-control versions of `on` and `once`. Tell *this* object to
    // listen to an event in another object ... keeping track of what it's
    // listening to.
    for(var method in listenMethods) {
        var implementation = listenMethods[method];
        EventEmitter.prototype[method] = function(obj, name, callback) {
            var listeningTo = this._listeningTo || (this._listeningTo = {});
            var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
            listeningTo[id] = obj;
            if (!callback && typeof name === 'object') callback = this;
            obj[implementation](name, callback, this);
            return this;
        };
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = EventEmitter;
    } else {
        this.EventEmitter = EventEmitter;
    }

})();

},{"./class":5}],28:[function(require,module,exports){
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

},{"./class":5,"./utils":29}],29:[function(require,module,exports){
(function (process){
(function(undefined){

    var _utils = require('util');

    var utils = {};

    // Util methods
    utils.bind = function(props) {
        for(var key in props) {
            this[key] = props[key];
        }
    }

    utils.bind(_utils);

    utils.inspect = function(obj, showHidden, depth) {
        if (arguments.length == 1) {
            showHidden = true;
        }
        if (arguments.length == 2) {
            depth = null;
        }
        return _utils.inspect(obj, { showHidden: showHidden, depth: depth });
    };

    utils.censor = function(censor) {
      var i = 0;

      return function(key, value) {
        if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
          return '[Circular]';

        if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
          return '[Unknown]';

        ++i; // so we know we aren't using the original object anymore

        return value;
      }
    }

    utils.assert = function(condition, message) {
        if (!condition) {
          console.log(testing);
          throw new Error(message || "Assertion failed");
        }
        return true;
    };

    /**
    */
    utils.randomize = function(min, max, bAsInt) {
        min = min || 0;
        max = max || 1;
        bAsInt = bAsInt || true;
        return function() {
          if (bAsInt) {
            return (Math.floor(Math.random() * (max - min + 1))) + min;
          } else {
            return (Math.random() * (max - min)) + min;
          }
        }
    }

    utils.performance = function() {
        var start = process.hrtime();
        this.start = function() {
            start = process.hrtime();
        }
        this.end = function(format) {
            var diff = process.hrtime(start);
            switch(format) {
                case "seconds" :
                case "s" :
                    return ((diff[0] * 1e9 + diff[1]) / 1000000000);
                    break;
                case "milliseconds" :
                case "ms" :
                    return ((diff[0] * 1e9 + diff[1]) / 1000000);
                    break;
                case "nanoseconds" :
                case "ns" :
                default :
                    return (diff[0] * 1e9 + diff[1]);
                    break;
            }
        }
    }

    /* Returns a number between 0 and 100 */
    utils.getPercent = function(numerator, denominator) {
        return denominator > 0 ? numerator / denominator * 100 : 0;
    }

    utils.cloneObject = function(obj) {
        var ret = {};
        try {
          return JSON.parse(JSON.stringify(obj));
        } catch (ex) {
          for (var key in obj) {
            ret[key] = obj[key];
          }
          return ret;
        }
        return null;
    }

    utils.thread = function(fn) {
        setTimeout(fn, 20);
    }

    utils.flipFlop = function(val) {
        val = !!val;
        val = 1 - val;
        return val;
    }

    utils.trim = function(str) {
        return (str || "").toString().replace(/^\s+|\s+$/g, '');
    }

    utils.clean = function(str) {
        return (str || "").toString().replace(/\s+/g, ' ').trim();
    }

    utils.getValue = function(data, key, defaultVal) {
        defaultVal = defaultVal || "";
        if (!data || data[key] === null)
          return defaultVal;
        return data[key];
    }

    utils.isValidDate = function(date) {
        return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
    }

    utils.slice = function(args, start, finish) {
        return Array.prototype.slice.call(args, start, finish || args.length);
    }

    utils.proto = function(obj, o) {
        obj = obj || {};
        for (var n in o) {
          var v = o[n];
          if (n) {
            obj.prototype[n] = v;
          }
        }
        return obj;
    }

    utils.merge = function(obj, o) {
        obj = obj || {};
        for (var n in o) {
          var v = o[n];
          if (n) {
            obj[n] = v;
          }
        }
        return obj;
    }

    utils.each = function(arr, fn, bind) {
        if (!arr) throw "Argument must be a valid variable";
        switch (typeof arr) {
          case "array":
            for (var i = 0, l = arr.length; i < l; i++) {
              if (i in arr)
                fn.call(bind, arr[i], i, arr);
            }
            break;
          case "object":
            for (var key in arr) {
              if (Object.prototype.hasOwnProperty.call(arr, key))
                fn.call(bind, arr[key], key, arr);
            }
            break;
          case "string":
          case "number":
            var chars = arr.toString().split('');
            for (var i = 0, l = chars.length; i < l; i++) {
              if (i in chars)
                fn.call(bind, chars[i], i, chars);
            }
            break;
          default:
        }
    }

    /**
     * Randomize array element order in-place.
     * Using Fisher-Yates shuffle algorithm.
     */
    utils.shuffleArray = function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    /**
     *
     */
    utils.isNumber = function(num) {
        return !isNaN(num);
    }

    /**
     *
     */
    utils.toInt = function(thing) {
        var ret = thing;
        if (typeof ret == 'string') {
            ret = parseInt(ret);
        } else if (typeof ret == 'object') {
            ret = parseInt(ret.toString())
            if (isNaN(ret)) {
                ret = parseInt(ret.valueOf());
            }
        } else if (typeof ret == 'function') {
            ret = ret();
        } else if (typeof ret == 'number') {
            return ret;
        }
        if (isNaN(ret)) {
            console.log("The argument cannot be converted to a number!");
            return null;
        } else {
            return ret;
        }
    }

    utils.capitaliseFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = utils;
    } else {
        this.utils = utils;
    }
})();



}).call(this,require('_process'))
},{"_process":2,"util":4}]},{},[29,5,27,28,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26]);
