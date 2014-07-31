var classTest = require('./class-test');

var policeman = new classTest.Policeman("Joe2", 40);
var policeman2 = new classTest.Policeman("John2", 38);
// Policeman.on('sayHello', function(policeman, args){
//     policeman.sayHello();
//     console.log(policeman.Name + " said hello.");
// })

// policeman.sayHello();
// console.log(policeman.Type);
// console.log(policeman.toObject());
// console.log(policeman + '');

// Policeman.fireEvent('sayHello', []);

console.log(classTest.Policeman);
console.log(policeman.Type.ParentType.ParentType);

