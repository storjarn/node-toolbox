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

