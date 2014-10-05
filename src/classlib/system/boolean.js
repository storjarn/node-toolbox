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

