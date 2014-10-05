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

},{"./utils":25}],6:[function(require,module,exports){
/**
    "Leather Jerkin" : {
        Weight: 3,
        Warmth: 5,
        Slots: 7,
        Armor : {
            Value : 5,
            "Blunt" : .2,
            "Cut" : .4,
            "Burn" : .7,
            "Pierce" : .2,
            "Freeze" : .3,
            "Poison" : .9
        }
    }
*/

var Armor = function(){

}

Armor.prototype.Value = 0;
Armor.prototype.Blunt = 0;
Armor.prototype.Cut = 0;
Armor.prototype.Burn = 0;
Armor.prototype.Pierce = 0;
Armor.prototype.Freeze = 0;
Armor.prototype.Poison = 0;

},{}],7:[function(require,module,exports){
/**
 *
 */

var Class = require('../class');

var Body = Class.extend('Body', {
    init : function(){
        this.parent();

        this.CurrentDamage = function() {
            var dmg = 0;
            for (var loc in this.HitLocations) {
                for (var i = 0; i < this.HitLocations[loc].Wounds.length; ++i) {
                    dmg += this.HitLocations[loc].Wounds[i].Value;
                }
            }
            return dmg;
        };

        this.Damage = function(wound, location) {
            var armor = null;
            var origValue = wound.Value;
            for (var itemName in this.Inventory[location]) {
                if (!!this.Inventory[location][itemName] && !!this.Inventory[location][itemName].Armor) {
                    armor = this.Inventory[location][itemName].Armor;
                    Wound.Value -= (armor[wound.DamageType] || 0) * (armor.Value || 0);
                }
            }
            if (wound.Value < 1) {
                wound = null;
            } else if (origValue / 2 > wound.Value) {
                wound.DamageType = "Blunt";
                wound.Shard = null;
            }
            if (!!wound) {
                this.HitLocations[location].Wounds.push(wound);
            }
        };
    },
    LoadBodyDefinition : function(configuration){
        var self = this;

        this.HitLocations = {};
        this.Inventory = {};

        var lookupIndex = 0;
        var lastIndex = 0;

        for(var key in configuration.Locations) {
            var location = configuration.Locations[key];
            this.HitLocations[key] = {
                Health : (function(location){
                    return function() {
                        return location.Health.apply(self);
                    }
                })(location),
                Wounds : []
            };
            this.Inventory[key] = location.InventorySlots;
            for(; lookupIndex < (lastIndex + location.Percentage); ++lookupIndex) {
                this.LocationLookup[lookupIndex.toString()] = key;
            }
            lastIndex = lookupIndex;
        }

        // console.log(self.HitLocations);
    },
    HitLocations : {},
    Inventory : {},
    LocationLookup : {},
    LookupLocation : function(index) {
        var bodyLocation = this.LocationLookup[index.toString()];
        return this.HitLocations[bodyLocation];
    },
    toData : function() {
        return {
            Inventory : this.Inventory
        }
    }
});

module.exports = Body;

},{"../class":5}],8:[function(require,module,exports){
/**
 */

(function(){

	var Body = require('./body');
	var Damage = require('./damage');

	var attributeDefaults = {
		Strength: 9,
		Perception: 9,
		Endurance: 9,
		Charisma: 9,
		Intelligence: 9,
		Agility: 9,
		Luck: 9,
		Willpower: 9
	}

	var Character = Body.extend('Character', {
		init: function(name, attributes){

			var self = this;

			this.parent();
			this.LoadBodyDefinition(BodyConfiguration);

			this.Name = name || "";
			this.Attributes = attributes || attributeDefaults;

			this.Size = (function(){
				return (self.Attributes.Strength + self.Attributes.Endurance) / 2
			})();

			this.Spirit = function(){
				return (self.Attributes.Luck / 2) + self.Attributes.Willpower + (self.Attributes.Intelligence / 2) + self.Attributes.Perception
			};
			this.Sanity = function(){
				return (self.Attributes.Willpower + self.Attributes.Luck) * 4 - self.Attributes.Perception
			};
			this.HitPoints = function(){
				return 15 + self.Attributes.Strength + (self.Attributes.Endurance * 2)
			};

			this.MovementSpeed = function(){ 	//in feet per 1 second
				return Math.max(1 + self.Attributes.Agility - self.CurrentDamage(), 0);
			};
			this.AttackSpeed = function() {		//In half seconds
				return Math.max(20 - self.Attributes.Agility + self.CurrentDamage(), 1);
			};

			this.MaxCarryWeight = function(){return 12 * self.Attributes.Strength};

			/**
				"Leather Jerkin" : {
					Weight: 3,
					Warmth: 5,
					Slots: 7,
					Armor : {
						Value : 5,
						"Blunt" : .2,
						"Cut" : .4,
						"Burn" : .7,
						"Pierce" : .2,
						"Freeze" : .3,
						"Poison" : .9
					}
				}
			*/

			this.Skills = {
				"Firearms" : function(){
					return self.Attributes.Agility + 10
				},
				"Archery" : function(){
					return 2 + (self.Attributes.Agility * 2) + (self.Attributes.Strength / 2)
				},
				"Explosives" : function(){
					return 2 + (self.Attributes.Perception * 2) + (self.Attributes.Luck / 2)
				},
				"Melee" : function(){
					return 30 + (2 * self.Attributes.Agility) + (2 * self.Attributes.Strength)
				},
				"Throwing" : function(){
					return 4 * self.Attributes.Agility
				},
				"Lockpick" : function(){
					return 20 + (self.Attributes.Perception / 2) + (self.Attributes.Agility / 2)
				},
				"Mechanics" : function(){
					return 20 + self.Attributes.Intelligence
				},
				"Medicine" : function(){
					return 2 + (self.Attributes.Intelligence * 2) + (self.Attributes.Luck / 2)
				},
				"Science" : function(){
					return 2 + (self.Attributes.Intelligence * 2) + (self.Attributes.Luck / 2)
				},
				"Craftsmanship" : function(){
					return (self.Attributes.Intelligence / 2) + (self.Attributes.Luck / 2) + (self.Attributes.Perception / 2) + (self.Attributes.Agility / 2)
				},
				"Stealth" : function(){
					return 2 + (self.Attributes.Agility * 2) + (self.Attributes.Luck / 2)
				},
				"Survival" : function(){
					return 2 + self.Attributes.Endurance + self.Attributes.Intelligence + (self.Attributes.Luck / 2)
				},
				"Barter" : function(){
					return 2 + (self.Attributes.Charisma * 2) + (self.Attributes.Luck / 2)
				},
				"Speech" : function(){
					return 2 + (self.Attributes.Charisma * 2) + (self.Attributes.Luck / 2)
				},
				"Athletics" : function(){
					return 2 + self.Attributes.Agility + self.Attributes.Strength + (self.Attributes.Endurance / 2)
				},
				"History" : function(){
					return 2 + (self.Attributes.Intelligence * 2) + (self.Attributes.Perception / 2)
				}
			}
			this.Specializations = {
				"Firearms" : {
					"General" : 0,
					"Pistol" : -10,
					"Submachine Gun" : -15,
					"Rifle" : -5,
					"Machine Gun" : -15
				},
				"Archery" : {
					"General" : -10,
					"Bow" : -10,
					"Crossbow" : -5
				},
				"Explosives" : {
					"General" : -20
				},
				"Melee" : {
					"General" : 0,
					"Shield" : -10,
					"Spear" : -15,
					"Knife" : -5,
					"Sword" : -10,
					"Axe" : -15,
					"Hammer" : -10,
					"Kung Fu" : -35
				},
				"Throwing" : {
					"General" : 0,
					"Spear" : -20,
					"Knife" : -10,
					"Axe" : -20
				},
				"Lockpick" : {
					"General" : 0
				},
				"Mechanics" : {
					"General" : 0,
					"Combustion" : -10,
					"Hydraulic" : -20
				},
				"Medicine" : {
					"General" : 0,
					"First Aid" : -5
				},
				"Science" : {
					"General" : 0,
					"Botany" : -10,
					"Mineral" : -15,
					"Electronic" : -20,
					"Computer" : -10,
					"Physics" : -10,
					"Nuclear" : -35,
					"Rocket" : -50
				},
				"Craftsmanship" : {
					"General" : 0,
					"Boatsmithing" : -20,
					"Leathersmithing" : 0,
					"Armorsmithing" : -10,
					"Bladesmithing" : -15,
					"Gemsmithing" : -25,
					"Blacksmithing" : -10,
					"Furrier" : -5,
					"Dyeing" : 0,
					"Coopersmithing" : -5,
					"Goldsmithing" : -15,
					"Gunsmithing" : -20,
					"Locksmithing" : -20,
					"Pottersmithing" : -5,
					"Ropesmithing" : -5,
					"Stonemasonry" : -10,
					"Weaving" : -5,
					"Carpentry" : 0
				},
				"Stealth" : {
					"General" : 0,
					"Steal" : -10,
					"Sneak" : -5
				},
				"Survival" : {
					"General" : 0,
					"Forest" : -5,
					"Desert" : -20,
					"Island" : -30,
					"Mountain" : -5
				},
				"Barter" : {
					"General" : 0
				},
				"Speech" : {
					"General" : 0,
					"Persuasion" : -10
				},
				"Piloting" : {
					"General" : 0,
					"Boat" : -10,
					"Aircraft" : -30,
					"Automobile" : -5
				},
				"Athletics" : {
					"General" : 0,
					"Jump" : -5,
					"Climb" : -10,
					"Ride" : -10,
					"Swim" : -20
				},
				"History" : {
					"General" : 0
				}
			}

			this.toData = function() {
				var wounds = {
					"Body" : this.HitLocations.Body.Wounds
				}
				var ret = {
					Attributes : this.Attributes,
					Specializations : this.Specializations,
					Name : this.Name,
					Inventory : this.Inventory,
					Wounds : wounds
				}
				// console.log(ret)
				return ret
			}

			this.loadData = function(data) {
				// console.log(data.Wounds['Left Leg']);
				if (data.Wounds) {
					for(var location in data.Wounds) {
						for (var i = 0; i < data.Wounds[location].length; ++i) {
							var wound = data.Wounds[location][i];
							var damage = new Damage[wound.DamageType].Class(wound.Value, wound.Shard, wound.Timestamp);
							this.HitLocations[location].Wounds.push(damage);
						}
					}
					delete data['Wounds'];
				}
				this.bind(data);
			}
		}
	});

	/**
	    Hit Locations: d100 (for a standard humanoid morph)
	    00-99 Body (~100%)
	*/

	var BodyConfiguration = {
	    Locations : {
	        "Body" : {
	            "Health" : function() { return this.HitPoints() },
	            "Percentage" : 100,
	            "InventorySlots" : {}
	        }
	    }
	}

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Character;
    } else {
        this.Character = Character;
    }
})();

},{"./body":7,"./damage":9}],9:[function(require,module,exports){
require('../class');

var damageTypes = [
    'Blunt', 'Cut', 'Burn', 'Pierce', 'Freeze', 'Poison'
]

var Damage = Class.extend('Damage', {
    init: function(value, shard, timestamp){
        this.parent();
        this.Value = value || 0;
        this.Shard = shard || null;
        this.Timestamp = timestamp || new Date().getTime();
    },
    trackInstances : false
})

Damage.Types = damageTypes;

for (var i = 0; i < damageTypes.length; ++i) {
    var damageType = damageTypes[i];
    var damageClass = (function(damageType){
        return Damage.extend(
            damageType+'Damage',
            {
                init: function(value, shard, timestamp) {
                    this.parent(value, shard, timestamp);
                    this.DamageType = damageType;
                }
            }
        )
    })(damageType);
    Damage[damageType] = {
        Name: damageType,
        Class: damageClass
    }
}

module.exports = Damage;



},{"../class":5}],10:[function(require,module,exports){
/**
 *
 */

var Character = require('./character');

var Humanoid = Character.extend('Humanoid', {
    init : function(name, attributes){
        this.parent(name, attributes);
        this.LoadBodyDefinition(BodyConfiguration);

        this.toData = function() {
            var wounds = {
                "Head" : this.HitLocations.Head.Wounds,
                "Left Leg" : this.HitLocations['Left Leg'].Wounds,
                "Right Leg" : this.HitLocations["Right Leg"].Wounds,
                "Chest" : this.HitLocations.Chest.Wounds,
                "Abdomen" : this.HitLocations.Abdomen.Wounds,
                "Left Arm" : this.HitLocations['Left Arm'].Wounds,
                "Right Arm" : this.HitLocations['Right Arm'].Wounds
            }
            var ret = {
                Attributes : this.Attributes,
                Specializations : this.Specializations,
                Name : this.Name,
                Inventory : this.Inventory,
                Wounds : wounds
            }
            return ret
        }
    }
})

module.exports = Humanoid;

/**
    Hit Locations: d100 (for a standard humanoid morph)
    00-04 Head (~5%)
    05-14 Right Arm (~10%)
    15-39 Chest (~25%)
    40-49 Left Arm (~10%)
    50-69 Abdomen (~20%)
    70-84 Right Leg (~15%)
    85-99 Left Leg (~15%)
*/

var BodyConfiguration = {
    Locations : {
        "Head" : {
            "Health" : function() { return this.HitPoints() / 5 },
            "Percentage" : 5,
            "InventorySlots" : {
                "Hat" : null,
                "EyeWear" : null,
                "EarWear" : null,
                "NeckWear" : null
            }
        },
        "Right Arm" : {
            "Health" : function() { return this.HitPoints() / 4 },
            "Percentage" : 10,
            "InventorySlots" : {
                "ShoulderWear" : null,
                "UpperMidWear" : null,
                "ElbowWear" : null,
                "LowerMidWear" : null,
                "WristWear" : null,
                "Gloves" : null
            }
        },
        "Chest" : {
            "Health" : function() { return this.HitPoints() / 2 },
            "Percentage" : 25,
            "InventorySlots" : {
                "CollarWear" : null,
                "LeftBreastWear" : null,
                "RightBreastWear" : null,
                "BackWear" : null
            }
        },
        "Left Arm" : {
            "Health" : function() { return this.HitPoints() / 4 },
            "Percentage" : 10,
            "InventorySlots" : {
                "ShoulderWear" : null,
                "UpperMidWear" : null,
                "ElbowWear" : null,
                "LowerMidWear" : null,
                "WristWear" : null,
                "Gloves" : null
            }
        },
        "Abdomen" : {
            "Health" : function() { return this.HitPoints() / 3 },
            "Percentage" : 20,
            "InventorySlots" : {
                "PlexusWear" : null,
                "BellyWear" : null,
                "Belt" : null,
                "GroinWear" : null
            }
        },
        "Right Leg" : {
            "Health" : function() { return this.HitPoints() / 3 },
            "Percentage" : 15,
            "InventorySlots" : {
                "HipWear" : null,
                "UpperMidWear" : null,
                "KneeWear" : null,
                "LowerMidWear" : null,
                "AnkleWear" : null,
                "Feet" : null
            }
        },
        "Left Leg" : {
            "Health" : function() { return this.HitPoints() / 3 },
            "Percentage" : 15,
            "InventorySlots" : {
                "HipWear" : null,
                "UpperMidWear" : null,
                "KneeWear" : null,
                "LowerMidWear" : null,
                "AnkleWear" : null,
                "Feet" : null
            }
        }
    }
}

},{"./character":8}],11:[function(require,module,exports){
var Class = require('../../class');
var Humanoid = require('../humanoid');
var dice = require('../../tools/dice');

var Dwarf = Humanoid.extend('Dwarf', {
    init : function(name) {
        var attributes = {
            Strength        : dice.roll(3, 6, 2).value,
            Perception      : dice.roll(3, 6, -2).value,
            Endurance       : dice.roll(3, 6, 4).value,
            Charisma        : dice.roll(3, 6, -2).value,
            Intelligence    : dice.roll(3, 6).value,
            Agility         : dice.roll(3, 6).value,
            Luck            : dice.roll(4, 4, 2).value,
            Willpower       : dice.roll(3, 6).value
        }
        this.parent(name, attributes);
        this.Specializations.Melee.Axe = 10;
        this.Specializations.Throwing.Axe = 10;
        this.Specializations.Melee.Hammer = 5;
        this.Specializations.Melee.Shield = 10;
        this.Specializations.Science.Mineral = 10;
        this.Specializations.Survival.Mountain = 20;
        this.Specializations.Explosives.General = 0;
        this.Specializations.Craftsmanship.General = 20;
        this.Specializations.Craftsmanship.Stonemasonry = 15;
        this.Size = this.Size * .75;
    }
})

module.exports = Dwarf;

},{"../../class":5,"../../tools/dice":24,"../humanoid":10}],12:[function(require,module,exports){
var Class = require('../../class');
var Humanoid = require('../humanoid');
var dice = require('../../tools/dice');

var Elf = Humanoid.extend('Elf', {
    init : function(name) {
        var attributes = {
            Strength        : dice.roll(3, 6, -2).value,
            Perception      : dice.roll(3, 6, 2).value,
            Endurance       : dice.roll(5, 4, -4).value,
            Charisma        : dice.roll(3, 6).value,
            Intelligence    : dice.roll(3, 6).value,
            Agility         : dice.roll(3, 6, 3).value,
            Luck            : dice.roll(3, 6).value,
            Willpower       : dice.roll(3, 6, 2).value
        }
        this.parent(name, attributes);
        this.Specializations.Archery.Bow = 20;
        this.Specializations.Survival.Forest = 15;
        this.Specializations.Medicine.General = 15;
        this.Specializations.Science.Botany = 15;
        this.Specializations.Craftsmanship.General = 15;
        this.Specializations.History.General = 15;
        this.Specializations.Athletics.General = 15;
        this.Size = this.Size * .9;
    }
})

module.exports = Elf;

},{"../../class":5,"../../tools/dice":24,"../humanoid":10}],13:[function(require,module,exports){
var Class = require('../../class');
var Humanoid = require('../humanoid');
var dice = require('../../tools/dice');

var Gnome = Humanoid.extend('Gnome', {
    init : function(name) {
        var attributes = {
            Strength        : dice.roll(3, 6, -2).value,
            Perception      : dice.roll(3, 6, 2).value,
            Endurance       : dice.roll(3, 6, 3).value,
            Charisma        : dice.roll(3, 6).value,
            Intelligence    : dice.roll(3, 6, 2).value,
            Agility         : dice.roll(3, 6).value,
            Luck            : dice.roll(4, 4, 4).value,
            Willpower       : dice.roll(3, 6, 2).value
        }
        this.parent(name, attributes);
        this.Specializations.Melee.Hammer = 10;
        this.Specializations.Science.Mineral = 20;
        this.Specializations.Science.General = 10;
        this.Specializations.Craftsmanship.General = 30;
        this.Specializations.Mechanics.General = 30;
        this.Specializations.Survival.Mountain = 10;
        this.Specializations.Stealth.General = 10;
        this.Specializations.Craftsmanship.Stonemasonry = 5;
        this.Size = this.Size * .6;
    }
})

module.exports = Gnome;

},{"../../class":5,"../../tools/dice":24,"../humanoid":10}],14:[function(require,module,exports){
var Class = require('../../class');
var Humanoid = require('../humanoid');

var Human = Humanoid.extend('Human', {
    init : function(name, attributes) {
        attributes = attributes || {
            Strength        : dice.roll(3, 6).value,
            Perception      : dice.roll(3, 6).value,
            Endurance       : dice.roll(3, 6).value,
            Charisma        : dice.roll(3, 6).value,
            Intelligence    : dice.roll(3, 6).value,
            Agility         : dice.roll(3, 6).value,
            Luck            : dice.roll(3, 6).value,
            Willpower       : dice.roll(3, 6).value
        }
        this.parent(name, attributes);
    }
})

module.exports = Human;

},{"../../class":5,"../humanoid":10}],15:[function(require,module,exports){
var Class = require('../../class');
var Humanoid = require('../humanoid');
var dice = require('../../tools/dice');

var Orc = Humanoid.extend('Orc', {
    init : function(name) {
        var attributes = {
            Strength        : dice.roll(3, 6, 2).value,
            Perception      : dice.roll(3, 6).value,
            Endurance       : dice.roll(3, 6, 4).value,
            Charisma        : dice.roll(5, 4, -4).value,
            Intelligence    : dice.roll(3, 6, -2).value,
            Agility         : dice.roll(3, 6).value,
            Luck            : dice.roll(3, 6).value,
            Willpower       : dice.roll(3, 6).value
        }
        this.parent(name, attributes);
        this.Specializations.Melee.Axe = 5;
        this.Specializations.Melee.Sword = 10;
        this.Specializations.Melee.Spear = 5;
        this.Specializations.Melee.Knife = 10;
        this.Specializations.Melee.Shield = 15;
        this.Specializations.Science.Mineral = 5;
        this.Specializations.Craftsmanship.Armorsmithing = 15;
        this.Specializations.Craftsmanship.Bladesmithing = 15;
        this.Size = this.Size * 1.1;
    }
})

module.exports = Orc;

},{"../../class":5,"../../tools/dice":24,"../humanoid":10}],16:[function(require,module,exports){
/**
 *
 */

var Class = require('../class');
var dice = require('../tools/dice');

var defaultBluntAttack = function() {
    return new Damage.Blunt.Class(dice.roll(1, 3));
};

var Weapon = Class.extend('Weapon', {
    init: function() {
        this.Attack.Bash = defaultBluntAttack;
    },
    Attack : {},
    CriticalMultiplier : 1.5,
    Material : null,
    Weight: 0
})

var RangedWeapon = Weapon.extend('RangedWeapon', {
    init: function() {
        this.parent();
        this.MaxRange = this.RangeIncrement * 10;
        this.Attack.Shoot = function(ammunition) {
            if (ammunition && ammunition.Count) {
                --ammunition.Count;
                var bowDamage = dice.roll(1, 8, 0).value;
                return ammunition.Damage(bowDamage);
            } else {
                throw new Error('That ammunition type is incorrect!');
            }
        }
    },
    RangeIncrement: 20,
    MaxRange: 100
})


var ThrownWeapon = RangedWeapon.extend('ThrownWeapon', {
    init: function() {
        this.parent();
        this.MaxRange = this.RangeIncrement * 5;
        this.Attack.Throw = function() {
            var dmg = dice.roll(1, 4, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
    }
})

exports.Weapon = Weapon;
exports.RangedWeapon = RangedWeapon;
exports.ThrownWeapon = ThrownWeapon;

},{"../class":5,"../tools/dice":24}],17:[function(require,module,exports){
var dice = require('../../tools/dice');
var Damage = require('./../damage');

exports['Standard Arrow'] = {
    Damage : function(modifier) {
        var dmg = dice.roll(2, 2, modifier).value;
        return new Damage.Pierce.Class(
            dmg,
            (function(){
                if (dmg > 3) {
                    return {Damage:dmg, Weapon:"Standard Arrow"}
                } else {
                    return null
                }
            })()
        )
    }
}

exports['Barbed Arrow'] = {
    Damage : function(modifier) {
        var dmg = dice.roll(2, 3, modifier).value;
        return new Damage.Pierce.Class(
            dmg,
            (function(){
                if (dmg > 3) {
                    return {Damage:dmg, Weapon:"Barbed Arrow"}
                } else {
                    return null
                }
            })()
        )
    }
}

},{"../../tools/dice":24,"./../damage":9}],18:[function(require,module,exports){
var weapon = require('./../weapon');
var Damage = require('./../damage');

var ThrowingAxe = weapon.ThrownWeapon.extend('ThrowingAxe', {
    init: function() {
        this.parent();
        this.Attack.Slice = function() {
            var dmg = dice.roll(1, 4, 0).value;
            return new Damage.Cut.Class(dmg);
        }
        this.Attack.Throw = function() {
            var dmg = dice.roll(2, 2, 0).value;
            return new Damage.Cut.Class(
                dmg,
                (function(){
                    if (dmg > 3) {
                        return {Damage:dmg, Weapon:"ThrowingAxe"}
                    } else {
                        return null
                    }
                })()
            );
        }
    },
    RangeIncrement: 10,
    Weight: 2
})

var HandAxe = weapon.ThrownWeapon.extend('HandAxe', {
    init: function() {
        this.parent();
        this.Attack.Slice = function() {
            var dmg = dice.roll(2, 3, 0).value;
            return new Damage.Cut.Class(dmg);
        }
        this.Attack.Throw = function() {
            var dmg = dice.roll(2, 4, 0).value;
            return new Damage.Cut.Class(
                dmg,
                (function(){
                    if (dmg > 3) {
                        return {Damage:dmg, Weapon:"HandAxe"}
                    } else {
                        return null
                    }
                })()
            );
        }
    },
    RangeIncrement: 10,
    Weight: 3
})

var WarAxe = weapon.Weapon.extend('WarAxe', {
    init: function() {
        this.parent();
        this.Attack.Slice = function() {
            var dmg = dice.roll(3, 3, 0).value;
            return new Damage.Cut.Class(dmg);
        }
    },
    Weight: 6
})

var BattleAxe = weapon.Weapon.extend('BattleAxe', {
    init: function() {
        this.parent();
        this.Attack.Slice = function() {
            var dmg = dice.roll(3, 4, 0).value;
            return new Damage.Cut.Class(dmg);
        }
    },
    Weight: 9
})

var GreatAxe = weapon.Weapon.extend('GreatAxe', {
    init: function() {
        this.parent();
        this.Attack.Slice = function() {
            var dmg = dice.roll(3, 5, 0).value;
            return new Damage.Cut.Class(dmg);
        }
    },
    Weight: 15
})

exports.ThrowingAxe = ThrowingAxe;
exports.HandAxe = HandAxe;
exports.WarAxe = WarAxe;
exports.BattleAxe = BattleAxe;
exports.GreatAxe = GreatAxe;

},{"./../damage":9,"./../weapon":16}],19:[function(require,module,exports){
var weapon = require('./../weapon');

var Bow = weapon.RangedWeapon.extend('Bow', {
    init: function() {
        this.parent();
    },
    RangeIncrement: 30,
    Weight: 2.5
})

var ShortBow = Bow.extend('Short Bow', {
    init: function() {
        this.parent();
    },
    RangeIncrement: 20,
    Weight: 2
})

var LongBow = Bow.extend('Long Bow', {
    init: function() {
        this.parent();
    },
    RangeIncrement: 40,
    Weight: 3
})

exports.Bow = Bow;
exports.LongBow = LongBow;
exports.ShortBow = ShortBow;

},{"./../weapon":16}],20:[function(require,module,exports){
var weapon = require('./../weapon');
var Damage = require('./../damage');

var Club = weapon.ThrownWeapon.extend('Club', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var dmg = dice.roll(1, 4, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
        this.Attack.Throw = function() {
            var dmg = dice.roll(1, 4, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
    },
    RangeIncrement: 10,
    Weight: 3
})

var Mace = weapon.Weapon.extend('Mace', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var dmg = dice.roll(2, 3, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
    },
    Weight: 4
})

var SpikedMace = weapon.Weapon.extend('SpikedMace', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var ret = [];
            var dmg = dice.roll(2, 3, 0).value;
            ret.push( new Damage.Blunt.Class(dmg) );
            dmg = dice.roll(1, 3, 0).value;
            ret.push( new Damage.Pierce.Class(dmg) );
        }
    },
    Weight: 5
})

var HeavyMace = weapon.Weapon.extend('HeavyMace', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var dmg = dice.roll(2, 4, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
    },
    Weight: 8
})

exports.Club = Club;
exports.Mace = Mace;
exports.SpikedMace = SpikedMace;
exports.HeavyMace = HeavyMace;

},{"./../damage":9,"./../weapon":16}],21:[function(require,module,exports){
var weapon = require('./../weapon');
var Damage = require('./../damage');

var LightHammer = weapon.ThrownWeapon.extend('LightHammer', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var dmg = dice.roll(1, 4, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
        this.Attack.Throw = function() {
            var dmg = dice.roll(2, 2, 0).value;
            return new Damage.Blunt.Class( dmg );
        }
    },
    RangeIncrement: 10,
    Weight: 2
})

var Hammer = weapon.Weapon.extend('Hammer', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var dmg = dice.roll(2, 4, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
    },
    Weight: 5
})

var WarHammer = weapon.Weapon.extend('WarHammer', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var dmg = dice.roll(3, 4, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
    },
    Weight: 9
})

var GreatHammer = weapon.Weapon('GreatHammer', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var dmg = dice.roll(3, 5, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
    },
    Weight: 15
})

exports.LightHammer = LightHammer;
exports.Hammer = Hammer;
exports.WarHammer = WarHammer;
exports.GreatHammer = GreatHammer;

},{"./../damage":9,"./../weapon":16}],22:[function(require,module,exports){
var weapon = require('./../weapon');
var Damage = require('./../damage');

var ShortSpear = weapon.ThrownWeapon.extend('ShortSpear', {
    init: function() {
        this.parent();
        this.Attack.Stab = function() {
            var dmg = dice.roll(1, 6, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
        this.Attack.Slice = function() {
            var dmg = dice.roll(1, 4, 0).value;
            return new Damage.Cut.Class(dmg);
        }
        this.Attack.Throw = function() {
            var dmg = dice.roll(2, 4, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
    },
    RangeIncrement: 20,
    Weight: 4
})

var Spear = weapon.ThrownWeapon.extend('Spear', {
    init: function() {
        this.parent();
        this.Attack.Stab = function() {
            var dmg = dice.roll(2, 4, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
        this.Attack.Slice = function() {
            var dmg = dice.roll(2, 3, 0).value;
            return new Damage.Cut.Class(dmg);
        }
        this.Attack.Throw = function() {
            var dmg = dice.roll(2, 6, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
    },
    RangeIncrement: 20,
    Weight: 6
})

var LongSpear = weapon.Weapon.extend('LongSpear', {
    init: function() {
        this.parent();
        this.Attack.Stab = function() {
            var dmg = dice.roll(3, 4, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
        this.Attack.Slice = function() {
            var dmg = dice.roll(3, 3, 0).value;
            return new Damage.Cut.Class(dmg);
        }
    },
    Weight: 9
})

exports.ShortSpear = ShortSpear;
exports.Spear = Spear;
exports.LongSpear = LongSpear;

},{"./../damage":9,"./../weapon":16}],23:[function(require,module,exports){
var weapon = require('./../weapon');
var Damage = require('./../damage');

var ShortSword = weapon.Weapon.extend('ShortSword', {
    init: function() {
        this.parent();
        this.Attack.Stab = function() {
            var dmg = dice.roll(1, 4, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
        this.Attack.Slice = function() {
            var dmg = dice.roll(1, 6, 0).value;
            return new Damage.Cut.Class(dmg);
        }
    },
    Weight: 3
})

var LongSword = weapon.Weapon.extend('LongSword', {
    init: function() {
        this.parent();
        this.Attack.Stab = function() {
            var dmg = dice.roll(2, 3, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
        this.Attack.Slice = function() {
            var dmg = dice.roll(2, 4, 0).value;
            return new Damage.Cut.Class(dmg);
        }
    },
    Weight: 4
})

var GreatSword = weapon.Weapon.extend('GreatSword', {
    init: function() {
        this.parent();
        this.Attack.Stab = function() {
            var dmg = dice.roll(3, 3, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
        this.Attack.Slice = function() {
            var dmg = dice.roll(3, 4, 0).value;
            return new Damage.Cut.Class(dmg);
        }
    },
    Weight: 8
})

exports.ShortSword = ShortSword;
exports.LongSword = LongSword;
exports.GreatSword = GreatSword;

},{"./../damage":9,"./../weapon":16}],24:[function(require,module,exports){
(function(undefined){

    /**
     *
     */

    var utils = require('../utils');

    var dice = {};

    var defaults = dice.defaults = {
        numberOfDie : 1,
        typeOfDie : 6,
        modifier : 0
    }

    var die = dice.die = {};
    for (var i = 2; i < 101; ++i) {
        die['d'+i] = utils.randomize(1, i);
    }

    var roll = dice.roll = function(numberOfDie, typeOfDie, modifier){
        numberOfDie = numberOfDie || defaults.numberOfDie;
        typeOfDie = typeOfDie || defaults.typeOfDie;
        modifier = modifier || defaults.modifier;

        var ret = {
            multiple: numberOfDie,
            typeOfDie : typeOfDie,
            modifier: modifier,
            rolls : [],
            value : 0
        };

        var roll = die['d' + typeOfDie];
        for(var i = 1; i < numberOfDie + 1; ++i) {
            var result = roll();
            ret.rolls.push(result);
            ret.value += result;
        }
        ret.value += modifier;

        return ret;
    }

    var createRoll = dice.createRoll = function(numberOfDie, typeOfDie, modifier){
        numberOfDie = numberOfDie || defaults.numberOfDie;
        typeOfDie = typeOfDie || defaults.typeOfDie;
        modifier = modifier || defaults.modifier;

        return function() {
            return exports.roll(numberOfDie, typeOfDie, modifier);
        }
    }

    var parseString = dice.parseString = function(str) {
        if (!!str && str.indexOf('d') > -1) {
            var typeOfDice = str.split('d');
            var numberOfDice = typeOfDice[0];
            typeOfDice = typeOfDice[1];
            var modifier = 0;
            if (typeOfDice.indexOf('m') > -1) {
                modifier = typeOfDice.split('m');
                typeOfDice = modifier[0];
                if (modifier.length > 1) {
                    modifier = modifier[1];
                } else {
                    modifier = 0;
                }
                // console.log(modifier)
            }
            numberOfDice = parseInt(numberOfDice.toString());
            typeOfDice = parseInt(typeOfDice.toString());
            modifier = parseInt(modifier.toString());

            if (isNaN(numberOfDice)) {
                throw new Error("The number of dice is not a number!");
            } else if (isNaN(typeOfDice)) {
                throw new Error("The type of dice is not a number!");
            } else if (isNaN(modifier)) {
                throw new Error("The modifier is not a number!");
            } else {
                return dice.roll(numberOfDice, typeOfDice, modifier);
            }
        } else {
            throw new Error("usage: pass the number of dice, type of dice, and modifier like so: 2d6m-8\nexample: parseString('2d6m-8') or parseString('3d6')");
        }
    }

    var test = dice.test = function(diceSetup, iterations){

        iterations = iterations || 100;

        var results = {};
        var performance = new util.performance();

        for(var j = 0; j < diceSetup.length; ++j) {
            performance.start();

            var multiple = diceSetup[j][0] || defaults.numberOfDie;
            var die = diceSetup[j][1] || defaults.typeOfDie;
            var modifier = diceSetup[j][2] || defaults.modifier;
            console.log("Iterating "+iterations+" times over "+ multiple + 'd' + die + '+' + modifier);
            for (var i = 0; i < iterations; ++i) {
                var result = exports.roll(multiple, die, modifier);
                if (!results[result.value.toString()]) {
                    results[result.value.toString()] = 0;
                }
                ++(results[result.value.toString()]);
            }
            console.log(results);
            results = {};
            console.log('This test took ' + performance.end('ms') + ' ms.')
        }
    }


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = dice;
    } else {
        this.dice = dice;
    }
})();

},{"../utils":25}],25:[function(require,module,exports){
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
},{"_process":2,"util":4}]},{},[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]);
