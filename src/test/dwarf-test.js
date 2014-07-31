var Dwarf = require('../rpg/races/dwarf');
var dice = require('../tools/dice');

var dwarf = new Dwarf("Dwarf Dude")

// console.log(dwarf);
var data = dwarf.toData();
// console.log(data);
// console.log(dwarf)


var dwarf2 = new Dwarf();
dwarf2.loadData(data);
console.log(dwarf2);

