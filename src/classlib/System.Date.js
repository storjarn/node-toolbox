(function(context, undefined){

    var Utility = require('./System.Utility');
    var System = Utility.ParentNamespace
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

    System.Date = Date

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Date;
    } else {
        this.Date = Date;
    }

/* public */

})(this);

