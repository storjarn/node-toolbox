(function(undefined){

   var Resources = require('./System.Resources')
   var System = Resources.ParentNamespace

   /*
          Resources.Integers
       */

    /* public */

    var Integers = new System.Namespace("Integers", Resources);
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
        module.exports = Integers;
    } else {
        // this.Integers = Integers;
    }

})();
