(function(){

    var Class = require('./class');

    var EventEmitter = Class.extend("EventEmitter", {

        init : function(){
            //parent() being called the old school way.
            this.parent.apply(this, arguments);
        },

        _maxListeners : 10,

        // Bind an event to a `callback` function. Passing `"all"` will bind
        // the callback to all events fired.
        on: function(name, callback, context) {
            if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
            this._events || (this._events = {});
            var events = this._events[name] || (this._events[name] = []);
            var evt = {callback: callback, context: context, ctx: context || this};
            if (this._maxListeners == 0 || events.length < this._maxListeners) {
                events.push(evt);
                this._events[name] = events;
            } else {
                throw new Error('This EventEmitter has already reached the maximum number of listeners!');
            }
            this.emit('newListener', evt);
            return this;
        },

        addListener : function() {
            return this.on.apply(this, arguments);
        },

        // Bind an event to only be triggered a single time. After the first time
        // the callback is invoked, it will be removed.
        once: function(name, callback, context) {
            if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
            var self = this;
            var once = _.once(function() {
              self.off(name, once);
              callback.apply(this, arguments);
            });
            once._callback = callback;
            return this.on(name, once, context);
        },

        // Remove one or many callbacks. If `context` is null, removes all
        // callbacks with that function. If `callback` is null, removes all
        // callbacks for the event. If `name` is null, removes all bound
        // callbacks for all events.
        off: function(name, callback, context) {
            var retain, ev, events, names, i, l, j, k;
            if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
            if (!name && !callback && !context) {
              this._events = {};
              return this;
            }
            names = name ? [name] : _.keys(this._events);
            for (i = 0, l = names.length; i < l; i++) {
              name = names[i];
              if (events = this._events[name]) {
                this._events[name] = retain = [];
                if (callback || context) {
                  for (j = 0, k = events.length; j < k; j++) {
                    ev = events[j];
                    if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                        (context && context !== ev.context)) {
                      retain.push(ev);
                    }
                  }
                }
                if (!retain.length) delete this._events[name];
              }
            }

            this.emit('removeListener');

            return this;
        },

        removeListener : function() {
            return this.off.apply(this, arguments);
        },

        // Trigger one or many events, firing all bound callbacks. Callbacks are
        // passed the same arguments as `trigger` is, apart from the event name
        // (unless you're listening on `"all"`, which will cause your callback to
        // receive the true name of the event as the first argument).
        trigger: function(name) {
            if (!this._events) return this;
            var args = Array.prototype.slice.call(arguments, 1);
            if (!eventsApi(this, 'trigger', name, args)) return this;
            var events = this._events[name];
            var allEvents = this._events.all;
            if (events) triggerEvents(events, args);
            if (allEvents) triggerEvents(allEvents, arguments);
            return this;
        },

        emit : function() {
            return this.trigger.apply(this, arguments);
        },

        removeAllListeners : function(name) {
            if (!this._events) return this;
            delete this['_events'];
            return this;
        },

        // Tell this object to stop listening to either specific events ... or
        // to every object it's currently listening to.
        stopListening: function(obj, name, callback) {
            var listeningTo = this._listeningTo;
            if (!listeningTo) return this;
            var remove = !name && !callback;
            if (!callback && typeof name === 'object') callback = this;
            if (obj) (listeningTo = {})[obj._listenId] = obj;
            for (var id in listeningTo) {
                obj = listeningTo[id];
                obj.off(name, callback, this);
                if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
            }
            return this;
        },

        setMaxListeners : function(n) {
            this._maxListeners = n;
        },

        listeners : function(eventName) {
            if (!this._events) return [];
            if (!this._events[name]) return [];
            return this._events[name];
        }

    }, {
        listenerCount: function(emitter, eventName) {
            if (!emitter._events) return 0;
            if (emitter._events[eventName] && emitter._events[eventName].length)
                return emitter._events[eventName].length;
            return 0;
        }
    });

    var extend = EventEmitter.extend;

    EventEmitter.extend = function() {
        var _class = extend.apply(this, arguments);

        if (!_class.isFinal) {
            _class.extend = arguments.callee;
        } else {
            _class.extend = function(){throw new Error("This class is marked as final and cannot be extended: " + _class.ClassName)}
        }

        if (!_class.on) {
            _class.on = function(eventName, callback){
                _class.prototype.on(eventName, callback);
            }
        }

        if (!_class.fireEvent) {
            _class.fireEvent = function(eventName, args){
                if (_class.trackInstances) {
                    for(var i = 0; i < _class.Instances.length; ++i) {
                        _class.Instances[i].emit.apply(
                            _class.Instances[i], [eventName].concat(args)
                        );
                    }
                }
            }
        }

        return _class;
    }

    // Regular expression used to split event strings.
    var eventSplitter = /\s+/;

    // Implement fancy features of the Events API such as multiple event
    // names `"change blur"` and jQuery-style event maps `{change: action}`
    // in terms of the existing API.
    var eventsApi = function(obj, action, name, rest) {
      if (!name) return true;

      // Handle event maps.
      if (typeof name === 'object') {
        for (var key in name) {
          obj[action].apply(obj, [key, name[key]].concat(rest));
        }
        return false;
      }

      // Handle space separated event names.
      if (eventSplitter.test(name)) {
        var names = name.split(eventSplitter);
        for (var i = 0, l = names.length; i < l; i++) {
          obj[action].apply(obj, [names[i]].concat(rest));
        }
        return false;
      }

      return true;
    };

    // A difficult-to-believe, but optimized internal dispatch function for
    // triggering events. Tries to keep the usual cases speedy (most internal
    // Backbone events have 3 arguments).
    var triggerEvents = function(events, args) {
      var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
      switch (args.length) {
        case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
        case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
        case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
        case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
        default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
      }
    };

    var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

    // Inversion-of-control versions of `on` and `once`. Tell *this* object to
    // listen to an event in another object ... keeping track of what it's
    // listening to.
    for(var method in listenMethods) {
        var implementation = listenMethods[method];
        EventEmitter.prototype[method] = function(obj, name, callback) {
            var listeningTo = this._listeningTo || (this._listeningTo = {});
            var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
            listeningTo[id] = obj;
            if (!callback && typeof name === 'object') callback = this;
            obj[implementation](name, callback, this);
            return this;
        };
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = EventEmitter;
    } else {
        this.EventEmitter = EventEmitter;
    }

})();
