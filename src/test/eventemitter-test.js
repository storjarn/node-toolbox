var EventEmitter = require('../eventemitter');

var eventClass = EventEmitter.extend('eventClass', {
    init : function() {
        this.on('newListener', function(evt){
            console.log(evt);
        });
    }
});

console.log( eventClass );

eventClass.on('sayWhoops', function(){
    console.log('whoops');
})

var thing = new eventClass();
var thing2 = new eventClass();

thing.on('cookie', function(stuff){
    console.log(stuff+'...');
});

thing.emit('cookie', 'stuff');

eventClass.fireEvent('sayWhoops');
