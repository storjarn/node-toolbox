(function(context, undefined){

  if (!context.JSCore && !context.JSCore.initialized) { throw "JSCore not initialized!"; }

    var Utility = context.Utility,
      Resources = context.Resources,
      Class = context.Class;

   /*
      Array (extensions)
   */

/* public static */
   Utility.merge(Array, {
   });

/* public */
   Utility.proto(Array, {
      insert : function(index) {
          index = Math.min(index, this.length);
          arguments.length > 1
              && this.splice.apply(this, [index, 0].concat([].pop.call(arguments)))
              && this.insert.apply(this, arguments);
          return this;
      },

      in : function(val) {
          for (var i = 0; i < array.length; ++i) {
              if (val == array[i]) return i;
          }
          return -1;
      }
   });

})(this);

