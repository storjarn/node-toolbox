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
