(function(undefined){


    var System = require('../../system'),
        Collections = require('../collections');
   /*
      Type: Collections.LinkedList
   */
/* public */
   var LinkedList = Collections.addClass(
      System.Class.extend("LinkedList", {
         init : function() {
             var _head = null;
             var _tail = null;
             var _curr = null;
             var _count = 0;
             this.Head = function() { return _head; };
             this.Tail = function() { return _tail; };
             this.Current = function() { return _curr; };
             this.Next = function() { if (_curr) return _curr.Next; else return null; };
             this.Count = function() { return _count; };
             this.clear = function() { _count = 0; _head = _tail = _curr = null; };
             this.reset = function() { _curr = _head; };
             this.add = function(obj){
                  var item = new LinkedListItem(obj);
                  if (_curr === null) { _head = _tail = _curr = item;
                  } else if (_curr === _head) { _tail = _head.Next = item;
                  } else if (_curr === _tail) { _tail = _tail.Next = item;
                  } else {
                       var next = _curr.Next; item.Next = next;
                       /* _curr = */_curr.Next = item;
                  }
                  ++_count;
             };
             this.remove = function(obj) { //By value
                  var prev = null;
                  for (var ptr = _head; ptr != null; ptr = ptr.Next) {
                       if (obj == ptr.Value) {
                            var next = ptr.Next;
                            if (prev) {
                                 --_count; prev.Next = next;
                                 if (next == null) _tail = prev;
                            } else if (_count == 1) { this.clear(); } else {
                                 if (next) { _head = next; --_count; } //else { this.clear(); }
                            }
                       }
                       prev = ptr;
                  }
             };

        }
      })
   );

   var LinkedListItem = Collections.addClass(
      System.Class.extend("LinkedListItem", {
         init : function(val){  this.Value = val || null; this.Next = null; }
      }
   );

/* public */

})();

