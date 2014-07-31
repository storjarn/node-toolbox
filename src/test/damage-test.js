var Damage = require('../rpg/damage');

// console.log(Damage);

var test = new Damage.Poison.Class(8, false);
// console.log(Damage.prototype);
// console.log(test);
// console.log(test.parent);
// console.log(test.Type);
// console.log(test.Type.ParentType);

test = new Damage.Poison.Class(10, true);
// console.log(Damage.Poison.Class);
// console.log(test);
// console.log(test.parent);
console.log(test.toObject());
// console.log(test.Type.ParentType);

