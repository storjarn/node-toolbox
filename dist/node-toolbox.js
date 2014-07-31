/*! node-toolbox - v0.0.1 - 2014-07-21
* https://github.com/storjarn/node-toolbox
* Copyright (c) 2014 Christopher Maples; Licensed  */
//#!/usr/local/bin/node

(function(context, undefined) {

    var Class = require('./eventemitter');

    var Console = Class.extend("Console", {

        init : function() {
            var self = this;

            ////////////////////////////////
            ////    Config
            ////////////////////////////////
            this.Config = {
                UserInputEnabled : true
            };

            ////////////////////////////////
            ////    Core
            ////////////////////////////////
            this.Arguments = process.argv.slice(2);
            this.Log = [];
            this.Errors = [];
            this.StdOut = null;
            this.StdErr = null;

            var sys = require('sys');
            var exec = require('child_process').exec;

            ////////////////////////////////
            ////    Input/Output
            ////////////////////////////////
            this.Input = {};
            this.InputHandlers = {
                StdIn : {
                    Echo : function(data) {
                        self.Write(data);
                    },
                    Quit : function(data) {
                        self.Exit(data || 0);
                    },
                    Start : function() {
                        self.ShowHelp();
                    }
                }
            };
            this.InputHandler = function(data) {};
            this.HandleInput = function(parent, name) {
                if (!!self.InputHandlers
                    && !!self.InputHandlers[parent][name]) {
                    self.InputHandler = self.InputHandlers[parent][name]
                    self.InputHandler.LastInput = (self.Input[parent] ? self.Input[parent][name] || '' : '');
                }
            };

            this.Write = function(data) {
                process.stdout.write(data);
            };

            this.WriteLine = function(data) {
                self.Write(data + '\n');
            };

            ////////////////////////////////
            ////    Events
            ////////////////////////////////
            self.EventHandlers = {
                process : {
                    SIGINT : [
                        function (ev) {
                            console.log("exiting...");
                            process.exit(0);
                        }
                    ]
                },
                stdin : {
                    data : [
                        function(data) {
                            self.InputHandler(data);
                            self.InputHandler.LastInput = data;
                        }
                    ]
                },

            };

            ////////////////////////////////
            ////    Runtime
            ////////////////////////////////
            self.Initialize = function(){

                if (self.Config.UserInputEnabled) {
                    process.stdin.resume();
                    process.stdin.setEncoding('utf8');

                    for (var eventName in self.EventHandlers.stdin) {
                        var eventName1 = eventName;
                        for (var i = 0; i < self.EventHandlers.stdin[eventName1].length; ++i) {
                            var stdinEvent = self.EventHandlers.stdin[eventName1][i];
                            process.stdin.on(eventName1, function (data) {
                                var eventName2 = eventName1;
                                console.log('Event ' +eventName2+ ' received.');
                                stdinEvent(data);
                            });
                        }
                    }
                }

                for (var eventName in self.EventHandlers.process) {
                    for (var i = 0; i < self.EventHandlers.process[eventName].length; ++i) {
                        (function(eventName1, i){
                            process.on(eventName1, function (ev) {
                                console.log('Event ' +eventName1+ ' received.');
                                if (!!self.EventHandlers.process[eventName1][i]) {
                                    if (typeof self.EventHandlers.process[eventName1][i] == 'function') {
                                        self.EventHandlers.process[eventName1][i](ev);
                                    }
                                }
                            });
                        })(eventName, i);
                    }
                }

            };

            this.Run = function(){
                self.Initialize();
                if(self.Arguments.length && (self.Arguments[0] === "--help" || self.Arguments[0] === "-h"))
                {
                    self.ShowHelp();
                } else {
                    self.Main();
                }
            };
            this.Main = function(){
                self.InputHandlers.StdIn.Start();
            };

            ////////////////////////////////
            ////    UI
            ////////////////////////////////
            this.ShowHelp = function(){
                console.log(this.HelpText);
            };
            this.HelpText = "usage: ...";

            ////////////////////////////////
            ////    Utility
            ////////////////////////////////
            this.consoleCallback = function(err, stderr, stdout, callback) {

                if (!!err)  {
                    sys.puts(stderr);
                    process.exit(1);
                } else {
                    sys.puts(stdout);
                }

                if (!!callback) {
                    callback();
                }
            };

            this.Exec = function(execCmd, callback){
                process.stdout.write("exec:  "+ execCmd + "\n");
                exec(execCmd, function(err, stdout, stderr) {
                    self.StdOut = stdout ? stdout.toString() : '';
                    self.StdErr = stderr ? stderr.toString() : '';
                    self.consoleCallback(err, stderr, stdout, function(){
                        !!callback && callback(err, stderr, stdout);
                    });
                });
            };

            this.cleanInput = function(data) {
                return data.replace(/\n/, "");
            };

            this.Exit = function(code) {
                process.exit(code || 0);
            };
        }
    });

    module.exports = Console;

})(this);






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

(function(context, undefined) {

    var Namespace = require('../namespace');
    var Class = require('../class');
    var EventEmitter = require('../eventemitter');
    var Utility = require('./system/utility');

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

(function(context, undefined){

  if (!context.JSCore && !context.JSCore.initialized) { throw "JSCore not initialized!"; }

    var Utility = context.Utility,
      Resources = context.Resources,
      Class = context.Class;

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


(function(context, undefined){

  if (!context.JSCore && !context.JSCore.initialized) { throw "JSCore not initialized!"; }

    var Utility = context.Utility,
      Resources = context.Resources,
      Class = context.Class;

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


(function(undefined){

   var System = require('../system');

    var Collections = new System.Namespace("Collections", System);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Collections;
    } else {
        this.System = System;
    }

})();

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
      }
   );

/* public */

})();


(function(context, undefined){

  if (!context.JSCore && !context.JSCore.initialized) { throw "JSCore not initialized!"; }

    var Utility = context.Utility,
      Resources = context.Resources,
      Class = context.Class;

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


(function(context, undefined){

   if (!context.JSCore && !context.JSCore.initialized) { throw "JSCore not initialized!"; }

     var Utility = context.Utility,
      Resources = context.Resources,
      Class = context.Class;

   /*
      Type: Error (extensions)
   */

/* public */
   context.TimeStampedError = Class.extend({
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


(function(context, undefined){

  if (!context.JSCore && !context.JSCore.initialized) { throw "JSCore not initialized!"; }

    var Utility = context.Utility,
      Resources = context.Resources,
      Class = context.Class;

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


(function(context, undefined){

   if (!context.JSCore && !context.JSCore.initialized) { throw "JSCore not initialized!"; }

     var Utility = context.Utility,
      System = context.System,
      Resources = context.Resources,
      Namespace = context.Namespace,
      Class = context.Class;

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


(function(context, undefined){

  if (!context.JSCore && !context.JSCore.initialized) { throw "JSCore not initialized!"; }

    var Utility = context.Utility,
      Resources = context.Resources,
      Class = context.Class;

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


(function(context, undefined){

  if (!context.JSCore && !context.JSCore.initialized) { throw "JSCore not initialized!"; }

    var Utility = context.Utility,
      Resources = context.Resources,
      Class = context.Class;

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

(function(context, undefined){

  if (!context.JSCore && !context.JSCore.initialized) { throw "JSCore not initialized!"; }

  var Utility = context.Utility,
      Resources = context.Resources,
      Class = context.Class;

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

(function(undefined){

   var Namespace = require('./namespace');
   var System = require('../system');

    var Threading = new Namespace("Threading", System);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Threading;
    } else {
        this.System = System;
    }

})();

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




(function(undefined){

   var Namespace = require('./namespace');
   var System = require('../system');
   var utils = require('../../utils');

    var Utility = new Namespace("Utility", System, utils);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Utility;
    } else {
        this.System = System;
    }

})();

(function(undefined){

   var Namespace = require('./namespace');

    var Web = new Namespace("Web");

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Web;
    } else {
        this.Web = Web;
    }

})();

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

#!/usr/local/bin/node

var Console = new (require('./../Console.js'))();

Console.InputHandlers.StdIn = {
    Echo : function(data) {
        Console.Write(data);
    },
    Quit : function(data) {
        Console.Exit(data || 0);
    },
    Start : function(data) {
        Console.Exec("git clean -n", function(err, stdout, stderr) {
            Console.WriteLine("Want to continue cleaning? y or n");
            Console.HandleInput('StdIn', 'Clean');
        });
    },
    Clean : function(data) {
        Console.Input.Clean = Console.cleanInput(data);

        if (Console.Input.Clean != 'n') {

            Console.Exec("git clean -f", function(err, stdout, stderr) {
                Console.Exit();
            });

        } else {
            Console.Exit();
        }
    }
};

Console.Main = function(){
    Console.InputHandlers.StdIn.Start();
};

Console.Run();


#!/usr/local/bin/node

var Console = new (require('./../Console.js'))();

Console.InputHandlers.StdIn = {
    Echo : function(data) {
        Console.Write(data);
    },
    Quit : function(data) {
        Console.Exit(data || 0);
    },
    Start : function(data) {
        Console.Exec("git rev-parse --abbrev-ref HEAD", function(err, stdout, stderr) {
            data = Console.cleanInput( Console.StdOut );
            Console.Input.BranchName = data;
            Console.Input.TicketName = Console.Input.BranchName.split("__")[0];

            Console.Exec("git status", function(err, stdout, stderr) {
                Console.WriteLine("Commit message? Type the message to continue or 'n' to quit");
                Console.HandleInput('StdIn', 'CommitMessage');
            });
        });
    },
    CommitMessage : function(data) {
        Console.Input.CommitMessage = Console.cleanInput(data).replace(/\"/, "\\\"");

        if (!!Console.Input.TicketName && Console.Input.CommitMessage != 'n') {
            Console.Exec(
                "git add -A . && git commit -am \""+Console.Input.TicketName+" "+Console.Input.CommitMessage+"\"",
                function(err, stdout, stderr) {
                    Console.WriteLine("Want to rebase branch? y or n");
                    Console.HandleInput('StdIn', 'RebaseBranchChoose');
                }
            );
        } else {
            Console.Exit(0);
        }
    },
    RebaseBranchChoose : function(data) {
        Console.Input.Rebase = Console.cleanInput(data);

        if (Console.Input.Rebase == 'y') {
            Console.WriteLine("Type the name of the branch you want to rebase onto.");
            Console.Exec("git branch -a", function(err, stdout, stderr){
                Console.HandleInput('StdIn', 'RebaseBranch');
            });
        } else {
            Console.Exit(0);
        }
    },
    RebaseBranch : function(data) {
        Console.Input.SwitchBranch = Console.cleanInput(data);

        if (!!Console.Input.SwitchBranch) {
            Console.Exec("git checkout " + Console.Input.SwitchBranch, function(err, stdout, stderr) {
                Console.Exec("git pull", function(err, stdout, stderr) {
                    Console.Exec("git checkout " + Console.Input.BranchName, function(err, stdout, stderr) {
                        Console.Exec("git rebase -i " + Console.Input.SwitchBranch, function(err, stdout, stderr) {
                            Console.Exec("git checkout " + Console.Input.SwitchBranch, function(err, stdout, stderr) {
                                Console.Exec("git pull", function(err, stdout, stderr) {
                                    Console.Exec("git checkout " + Console.Input.BranchName, function(err, stdout, stderr) {
                                        Console.Exit(0);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } else {
            Console.Exit(0);
        }
    }
};

Console.Main = function(){
    Console.InputHandlers.StdIn.Start();
};

Console.Run();







#!/usr/local/bin/node

var Console = new (require('./../Console.js'))();

Console.InputHandlers.StdIn = {
    Echo : function(data) {
        Console.Write(data);
    },
    Quit : function(data) {
        Console.Exit(data || 0);
    },
    Start : function(data) {
        Console.Exec("git rev-parse --abbrev-ref HEAD", function(err, stdout, stderr) {
            data = Console.cleanInput( Console.StdOut );
            Console.Input.BranchName = data;
            Console.Input.TicketName = Console.Input.BranchName.split("__")[0];

            Console.WriteLine("Delete the current branch? y or n");
            Console.HandleInput('StdIn', 'SelectBranch');
        });
    },
    SelectBranch : function(data) {
        Console.Input.DeleteBranch = Console.cleanInput(data);

        if (Console.Input.DeleteBranch == 'y') {
            Console.WriteLine("Type the name of the branch you want to change to.");
            Console.Exec("git branch -r", function(err, stdout, stderr){
                Console.HandleInput('StdIn', 'DeleteBranch');
            });
        } else {
            Console.Exit(0);
        }
    },
    DeleteBranch : function(data) {
        Console.Input.SwitchBranch = Console.cleanInput(data);
        if (!!Console.Input.SwitchBranch) {
            Console.Exec("git checkout " + Console.Input.SwitchBranch, function(err, stdout, stderr) {
                Console.Exec("git push origin :" + Console.Input.BranchName, function(err, stdout, stderr) {
                    Console.Exec("git branch -d " + Console.Input.BranchName, function(err, stdout, stderr) {
                        Console.Exit(0);
                    });
                });
            });
        }
    }
};

Console.Main = function(){
    Console.InputHandlers.StdIn.Start();
};

Console.Run();





#!/usr/local/bin/node

var Console = new (require('./../Console.js'))();

Console.Main = function(){
    Console.Exec("git rev-parse --abbrev-ref HEAD", function(err, stdout, stderr) {

        Console.Input.BranchName = Console.cleanInput( stdout.toString() );

        Console.Exec("git push origin "+Console.Input.BranchName+"", function(err, stdout, stderr){
            Console.Exit();
        });
    });
};

Console.Run();


#!/usr/local/bin/node

var Console = new (require('./../Console.js'))();

Console.InputHandlers.StdIn = {
    Echo : function(data) {
        Console.Write(data);
    },
    Quit : function(data) {
        Console.Exit(data || 0);
    },
    Start : function(data) {
        Console.WriteLine("This application will create a new branch based on a ticket identifier (number) and ticket name, which allows for the other applications in this suite to do things like commit with the ticket number tagged in the commit message.");
        Console.WriteLine("");
        Console.WriteLine("In JIRA, for example, ticket numbers are likely the Epic name (uppercase) and the ticket id, like so: USERS-766.");
        Console.WriteLine("");
        Console.WriteLine("This allows for a git workflow that is based on individual tickets.");
        Console.WriteLine("");

        Console.WriteLine("What is your ticket number? ex. USERS-766");
        Console.HandleInput('StdIn', 'TicketNumber');
    },
    TicketNumber : function(data) {
        Console.Input.TicketNumber = !!data ? Console.cleanInput(data).toUpperCase() : null;
        Console.WriteLine("What is your ticket name? ex. can edit my own information");
        Console.HandleInput('StdIn', 'TicketName');
    },
    TicketName : function(data) {
        Console.Input.TicketName = !!data ? Console.cleanInput(data).toLowerCase().split(" ").join("-") : null;

        if (!!Console.Input.TicketName && !!Console.Input.TicketNumber) {

            var branchName = Console.Input.TicketNumber+"__"+Console.Input.TicketName;

            Console.Exec("git checkout -b "+branchName, function(err, stdout, stderr) {
                Console.Exec(
                    "git push --set-upstream origin " + branchName,
                    function(err, stdout, stderr){
                        Console.Exit();
                    }
                )
            });

        } else {
            Console.WriteLine("Error:  You need to provide a ticket number and name!");
            Console.Exit(1);
        }
    }
};

Console.Run();



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

var Armor = function(){

}

Armor.prototype.Value = 0;
Armor.prototype.Blunt = 0;
Armor.prototype.Cut = 0;
Armor.prototype.Burn = 0;
Armor.prototype.Pierce = 0;
Armor.prototype.Freeze = 0;
Armor.prototype.Poison = 0;

require('../class');

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



var Character = require('./Character');

var Humanoid = RPG.Character.extend('Humanoid', {
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

require('../../class');
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

require('../../class');
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

require('../../class');
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

module.exports = Dwarf;

require('../class');
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

require('../../class');
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

var Class = require('./class');
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

var weapon = require('./../weapon');

var Bow = weapon.RangedWeapon.extend('Bow', {
    init: function() {
        this.parent();
    },
    RangeIncrement: 30,
    Weight: 2.5
})

var ShortBow = weapon.Bow.extend('Short Bow', {
    init: function() {
        this.parent();
    },
    RangeIncrement: 20,
    Weight: 2
})

var LongBow = weapon.Bow.extend('Long Bow', {
    init: function() {
        this.parent();
    },
    RangeIncrement: 40,
    Weight: 3
})

exports.Bow = Bow;
exports.LongBow = LongBow;
exports.ShortBow = ShortBow;

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

require('../class')

var Person = Class.extend("Person", {
    init : function(name, age){
        // this.parent();
        this.hasDog = false;
        this.Name = name;
        this.Age = age;
    },
    "Name" : "Joe",
    "Age" : 10,
    sayHello : function() {
        console.log("Hello!");
    }
}, {
    test: function(){}
})

var Policeman = Person.extend("Policeman", {
    init : function(name, age){
        this.parent(name, age);
    },
    extends: Person,
    "Age" : 40,
    sayHello : function() {
        this.parent();
        console.log("Can I see your papers?");
    }
})

var policeman = new Policeman("Joe", 40);
var policeman2 = new Policeman("John", 38);
// Policeman.on('sayHello', function(policeman, args){
//     policeman.sayHello();
//     console.log(policeman.Name + " said hello.");
// })

// policeman.sayHello();
// console.log(policeman.Type);
// console.log(policeman.toObject());
// console.log(policeman + '');

// Policeman.fireEvent('sayHello', []);

console.log(policeman);

exports.Person = Person;
exports.Policeman = Policeman;
exports.Class = Class;

var classTest = require('./class-test');

var policeman = new classTest.Policeman("Joe2", 40);
var policeman2 = new classTest.Policeman("John2", 38);
// Policeman.on('sayHello', function(policeman, args){
//     policeman.sayHello();
//     console.log(policeman.Name + " said hello.");
// })

// policeman.sayHello();
// console.log(policeman.Type);
// console.log(policeman.toObject());
// console.log(policeman + '');

// Policeman.fireEvent('sayHello', []);

console.log(classTest.Policeman);
console.log(policeman.Type.ParentType.ParentType);


var Damage = require('../rpg/damage');

// console.log(Damage);

var test = new Damage.Poison.Class(8, false);
// console.log(Damage.prototype);
// console.log(test);
// console.log(test.parent);
// console.log(test.Type);
// console.log(test.Type.ParentType);

test = new Damage.Poison.Class(10, true);
// console.log(Damage.Poison.Class);
// console.log(test);
// console.log(test.parent);
console.log(test.toObject());
// console.log(test.Type.ParentType);


var dice = require('../tools/dice');

var iterations = 100;
var diceSetup = [
    // [2, 6, 3],
    // [1, 100, 0],
    // [1, 20, 0],
    // [3, 6, 0],
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 2]
];

dice.test(diceSetup, iterations);

// console.log(dice.roll(3, 6, 2));

// console.log(dice);


var Dwarf = require('../rpg/races/dwarf');
var dice = require('../tools/dice');

var dwarf = new Dwarf("Dwarf Dude")

// console.log(dwarf);
var data = dwarf.toData();
// console.log(data);
// console.log(dwarf)


var dwarf2 = new Dwarf();
dwarf2.loadData(data);
console.log(dwarf2);


var Body = require('../rpg/body');
var Humanoid = require('../rpg/humanoid');

var Elf = require('../rpg/races/elf');

var elf = new Elf("Elf Dude")

// console.log(elf);
var data = elf.toData();
// console.log(data);
// console.log(elf)


var elf2 = new Elf();
elf2.loadData(data);
console.log(elf2);

console.log( elf2 instanceof Humanoid)
console.log( elf2 instanceof Body)

console.log( elf2.toString() )


var EventEmitter = require('../eventemitter');

var eventClass = EventEmitter.extend('eventClass', {
    init : function() {
        this.on('newListener', function(evt){
            console.log(evt);
        });
    }
});

console.log( eventClass );

eventClass.on('sayWhoops', function(){
    console.log('whoops');
})

var thing = new eventClass();
var thing2 = new eventClass();

thing.on('cookie', function(stuff){
    console.log(stuff+'...');
});

thing.emit('cookie', 'stuff');

eventClass.fireEvent('sayWhoops');

var Humanoid = require('../rpg/humanoid');
var dice = require('../tools/dice');
var Damage = require('../rpg/damage');
var BarbedArrow = require('../rpg/weapons/arrow')['Barbed Arrow'];

var person = new Humanoid("Dude", {
    Strength        : dice.roll(3, 6).value,
    Perception      : dice.roll(3, 6).value,
    Endurance       : dice.roll(3, 6).value,
    Charisma        : dice.roll(3, 6).value,
    Intelligence    : dice.roll(3, 6).value,
    Agility         : dice.roll(3, 6).value,
    Luck            : dice.roll(3, 6).value,
    Willpower       : dice.roll(3, 6).value
})

var arrow = BarbedArrow.Damage(5);

person.Damage(arrow, "Left Leg");

// console.log(person);
var data = person.toData();
// console.log(data);
// console.log(person)


var person2 = new Humanoid();
person2.loadData(data);
console.log(person2.HitLocations['Left Leg'].Wounds);


var Namespace = require('../namespace');

console.log(Namespace.prototype);

var System = new Namespace("System");

console.log(System.getFullyQualifiedName());

var Utility = System.addNamespace(new Namespace("Utility"));

console.log(Utility.getFullyQualifiedName());
// console.log(System);

Utility.bind({test: function(){console.log('test')}})
Utility.test();

System.addClass(Namespace);

Namespace.implement({whoops:"whoops"})

// var Natives = System.addNamespace(new Namespace("Natives"));

console.log(System.whoops);

// console.log(Namespace.Instances)

// var whoops = Namespace.extend("thisShouldThrowAnError", {});

console.log(System.toObject())

var Bow = require('../rpg/weapons/bow').Bow;
var Arrow = require('../rpg/weapons/arrow');

var myBow = new Bow();
var quiver = {
    "Standard Arrow" : {
        Count : 20,
        Damage : Arrow['Standard Arrow'].Damage
    }
}

console.log(myBow.toObject());
console.log(myBow.Attack.Melee());
while(quiver['Standard Arrow'].Count) {
    console.log(
        myBow.Attack.Shoot(quiver['Standard Arrow']).toObject()
    );
}
console.log(quiver)

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

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = utils;
    } else {
        this.utils = utils;
    }
})();



#!/usr/bin/env node

var program = require('commander'),
    path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec;

var Promise = require("bluebird");
exec = Promise.promisify(exec);
program.prompt = Promise.promisify(program.prompt);

program
  .version(JSON.parse(fs.readFileSync(__dirname + '/../../package.json', 'utf8')).version)
  .usage('')
  .option('-u, --dbuser <dbuser>', 'name of the database user to own the database')
  .option('-db, --dbname <dbname>', 'name of the database to create')
  .option('-p, --dbpass <dbpass>', 'password of the database user')

program.name = 'node-toolbox.tools.db.postgres.new';

var newShellTemplate = "#!/bin/sh\n\necho \"Recreating the database 'DBNAME' in postgres.\"\npsql -h localhost -U postgres -a -f EXECPATH/pg.db.DBNAME.create.sql";

var newSqlTemplate = "\n" +
"REVOKE CONNECT ON DATABASE DBNAME FROM public;\n" +
"ALTER DATABASE DBNAME CONNECTION LIMIT 0;\n" +
"\n" +
"-- 9.1\n" +
"SELECT pg_terminate_backend(procpid)\n" +
"FROM pg_stat_get_activity(NULL::integer)\n" +
"WHERE datid=(SELECT oid from pg_database where datname = 'DBNAME');\n" +
"\n" +
"-- SELECT pg_terminate_backend(pg_stat_activity.procpid)\n" +
"-- FROM pg_stat_activity\n" +
"-- WHERE pg_stat_activity.datname = 'DBNAME'\n" +
"--   AND procpid <> pg_backend_pid();\n" +
"\n" +
"-- 9.2+\n"+
"SELECT pg_terminate_backend(pid)\n" +
"FROM pg_stat_get_activity(NULL::integer)\n" +
"WHERE datid=(SELECT oid from pg_database where datname = 'DBNAME');\n" +
"\n" +
"-- SELECT pg_terminate_backend(pid)\n" +
"--  FROM pg_stat_activity\n" +
"--  WHERE pid <> pg_backend_pid()\n" +
"--  AND datname='DBNAME';\n" +
"\n" +
"DROP DATABASE IF EXISTS DBNAME;\n" +
"DROP ROLE IF EXISTS USERNAME;\n" +
"\n" +
"CREATE ROLE USERNAME ENCRYPTED PASSWORD 'PASSWD' LOGIN INHERIT SUPERUSER;\n" +
"CREATE DATABASE DBNAME OWNER USERNAME;\n" +
"GRANT ALL PRIVILEGES ON DATABASE DBNAME TO USERNAME;\n";

program.parse(process.argv);

// console.log(program);

function createPassword() {
    return require('crypto').createHash('md5');
}

function setVars(txt, vars) {
    return txt.toString()
        .replace(/DBNAME/ig, vars.dbname)
        .replace(/USERNAME/ig, vars.dbuser)
        .replace(/PASSWD/ig, vars.dbpass);
}

function hasVars(execPath){

    promptDbPassword()
    .then(function(){

        var rootPath = path.resolve(path.join(execPath, program.dbname));
        var shellpath = rootPath + ".sh";
        var sqlpath = rootPath + ".sql";

        var vars = {
            dbname : program.dbname,
            dbuser : program.dbuser,
            dbpass : program.dbpass
        }

        var shellTxt = setVars(newShellTemplate, vars);

        var sqlTxt = setVars(newSqlTemplate, vars);

        fs.writeFileSync(shellpath, shellTxt);

        exec("chmod 755 " + shellpath)
        .then(function(error, stdout, stderr){
            if (error) throw error;
            fs.writeFileSync(sqlpath, sqlTxt);
            exec("ls -la " + rootPath, function(error, stdout, stderr){
                if (error) throw error;
                console.log('Files saved!');
                process.exit(0);
            });
        }, function(error) {
            if (error) throw error;
        })
    }, function(err) {
        if (error) throw error;
    })
}

function promptDbName (callback) {
    program.prompt('\nYour database name: ', function(name){
        program.dbname = name;
        if (!!program.dbname && !!program.dbuser) {
            hasVars( "./" )
        } else {
            program.help();
        }
    });
}

var promptDbPassword = Promise.promisify(function() {
    if (!program.dbpass) {
        program.prompt('\nWould you like a password generated for you? (y or n): ', function(generate){
            if (generate == 'n') {
                program.prompt('\nYour database password: ', function(name){
                    program.dbpass = name;
                    if (!!program.dbname && !!program.dbuser) {
                        hasVars( "./" )
                    } else {
                        program.help();
                    }
                });
            } else {
                program.dbpass = createPassword();
            }
        });
    }
});


function promptDbUsername() {
    program.prompt('\nYour database username: ', function(name){
        program.dbuser = name;
        if (!!program.dbname && !!program.dbuser) {
            hasVars( "./" )
        } else {
            program.help();
        }
    });
}

if (!!program.dbname && !!program.dbuser) {
    hasVars( "./" )
} else if(!!program.dbuser) {
    promptDbName();
} else if(!!program.dbname) {
    promptDbUsername();
} else {
    promptDbName();
}


#!/usr/local/bin/node

var Console = new (require('./../../src/Console.js'))();
var dice = require('./../../src/tools/dice');

Console.InputHandlers.StdIn = {
    Echo : function(data) {
        Console.Write(data);
    },
    Quit : function(data) {
        Console.Exit(data || 0);
    },
    Start : function(data) {
        if (Console.Arguments.length && Console.Arguments[0].indexOf('d') > -1) {
            try {
                console.log(dice.parseString(Console.Arguments[0]).value)
            } catch(ex) {
                console.log(ex.message);
                Console.ShowHelp();
            }
        } else {
            Console.ShowHelp();
        }
        Console.Exit();
    }
};

Console.HelpText = "usage: pass the number of dice, type of dice, and modifier like so: 2d6m-8\nexample: dice 2d6m-8 or dice 3d6";

Console.Run();



#!/usr/bin/env node

var program = require('commander'),
    path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec;

var extension = '';

program
  .version(JSON.parse(fs.readFileSync(__dirname + '/../../package.json', 'utf8')).version)
  .usage('')
  .option('-ne, --no-extension', 'create the program without the "js" extension')
  .option('-pn, --programname <programname>', 'name of the program file to create')
  .option('-pl, --programlocation <programlocation>', 'folder path to create the file')

program.name = 'node-toolbox.tools.node.newprogram';

var newProgramTemplate = "#!/usr/bin/env node \n\n(function(context, undefined){\n\n})(this);";

program.parse(process.argv);

// console.log(program);

function hasNameAndLocation(name, location){
    if (program.extension == true) {
        extension = '.js';
    }
    var filepath = path.resolve(path.join(location, name) + extension);

    // console.log(program);

    fs.writeFile(filepath, newProgramTemplate, function (err) {
        if (err) throw err;
        exec("chmod 755 " + filepath, function(error, stdout, stderr){
            if (error) throw error;
            exec("ls -la " + filepath, function(error, stdout, stderr){
                if (error) throw error;
                console.log(filepath+' saved!');
                process.exit(0);
            });
        });
    });
}

function promptName (callback) {
    program.prompt('\nYour program name: ', function(name){
        program.programname = name;
        if (!!program.programname && !!program.programlocation) {
            hasNameAndLocation(
                program.programname, program.programlocation
            )
        } else if (!!callback) {
            callback();
        } else {
            program.help();
        }
    });
}

function promptLoc(callback) {
    program.prompt('\nYour program location: ', function(location){
        program.programlocation = location;
        if (!!program.programname && !!program.programlocation) {
            hasNameAndLocation(
                program.programname, program.programlocation
            )
        } else if (!!callback) {
            callback();
        } else {
            program.help();
        }
    });
}

if (!!program.programname && !!program.programlocation) {
    hasNameAndLocation(
        program.programname, program.programlocation
    )
} else if(!!program.programname) {
    promptName();
} else if(!!program.programlocation) {
    promptLoc();
} else {
    promptName(promptLoc);
}



