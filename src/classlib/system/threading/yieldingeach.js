(function(undefined){

    var Threading = require('../threading'),
        System = require('../../system'),
        Namespace = require('../../../namespace');

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
    var YieldingEach = Threading.addClass(
      System.Class.extend("YieldingEach", {
        init : function() {
        },
        exec : function  (items, iterFn, callback) {
            var i = 0, len = items.length;
            System.Utility.thread(function () {
                var result;

                // Process the items in batch for 50 ms, or while the result of
                // calling `iterFn` on the current item is not false..
                for ( var start = +new Date;
                      i < len && result !== false && ((+new Date) - start < 50);
                      i++ ) {
                    result = iterFn.call(items[i], items[i], i);
                }

                // When the 50ms is up, let the UI thread update by defering the
                // rest of the iteration with `async`.
                if ( i < len && result !== false ) {
                    System.Utility.thread(arguments.callee);
                } else {
                    callback(items);
                }
            });
        }
     })
   );


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = YieldingEach;
    } else {
        this.System = System;
    }

})();



