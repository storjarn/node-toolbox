(function(undefined){

    var Collections = require('./System.Collections');
    var System = Collections.ParentNamespace
        
   /*
      Type: Collections.LinkedListItem
   */
/* public */
   var LinkedListItem = Collections.addClass(
      System.Class.extend("LinkedListItem", {
         init : function(val){  this.Value = val || null; },
         Next : null
      })
   )

   if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = LinkedListItem;
    } else {
        // this.LinkedListItem = LinkedListItem;
    }

})();

