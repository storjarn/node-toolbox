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
