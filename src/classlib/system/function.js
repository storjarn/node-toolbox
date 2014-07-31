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

