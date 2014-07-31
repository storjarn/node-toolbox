var Body = require('../rpg/body');
var Humanoid = require('../rpg/humanoid');

var Elf = require('../rpg/races/elf');

var elf = new Elf("Elf Dude")

// console.log(elf);
var data = elf.toData();
// console.log(data);
// console.log(elf)


var elf2 = new Elf();
elf2.loadData(data);
console.log(elf2);

console.log( elf2 instanceof Humanoid)
console.log( elf2 instanceof Body)

console.log( elf2.toString() )

