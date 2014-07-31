var Namespace = require('../namespace');

console.log(Namespace.prototype);

var System = new Namespace("System");

console.log(System.getFullyQualifiedName());

var Utility = System.addNamespace(new Namespace("Utility"));

console.log(Utility.getFullyQualifiedName());
// console.log(System);

Utility.bind({test: function(){console.log('test')}})
Utility.test();

System.addClass(Namespace);

Namespace.implement({whoops:"whoops"})

// var Natives = System.addNamespace(new Namespace("Natives"));

console.log(System.whoops);

// console.log(Namespace.Instances)

// var whoops = Namespace.extend("thisShouldThrowAnError", {});

console.log(System.toObject())
