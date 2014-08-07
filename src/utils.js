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


