(function(context, undefined){

    var Utility = require('./System.Utility');
    var System = Utility.ParentNamespace

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

    System.Math = Math

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Math;
    } else {
        this.Math = Math;
    }

})(this);

