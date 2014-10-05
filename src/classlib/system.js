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
