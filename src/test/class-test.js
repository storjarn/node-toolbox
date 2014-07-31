require('../class')

var Person = Class.extend("Person", {
    init : function(name, age){
        // this.parent();
        this.hasDog = false;
        this.Name = name;
        this.Age = age;
    },
    "Name" : "Joe",
    "Age" : 10,
    sayHello : function() {
        console.log("Hello!");
    }
}, {
    test: function(){}
})

var Policeman = Person.extend("Policeman", {
    init : function(name, age){
        this.parent(name, age);
    },
    extends: Person,
    "Age" : 40,
    sayHello : function() {
        this.parent();
        console.log("Can I see your papers?");
    }
})

var policeman = new Policeman("Joe", 40);
var policeman2 = new Policeman("John", 38);
// Policeman.on('sayHello', function(policeman, args){
//     policeman.sayHello();
//     console.log(policeman.Name + " said hello.");
// })

// policeman.sayHello();
// console.log(policeman.Type);
// console.log(policeman.toObject());
// console.log(policeman + '');

// Policeman.fireEvent('sayHello', []);

console.log(policeman);

exports.Person = Person;
exports.Policeman = Policeman;
exports.Class = Class;
