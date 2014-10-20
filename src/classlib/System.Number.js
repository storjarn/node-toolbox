(function(context, undefined){

    var Utility = require('./System.Utility');
    var System = Utility.ParentNamespace

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

    System.Number = Number

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Number;
    } else {
        this.Number = Number;
    }

})(this);
