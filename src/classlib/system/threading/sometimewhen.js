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



