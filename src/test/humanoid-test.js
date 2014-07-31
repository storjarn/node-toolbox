var Humanoid = require('../rpg/humanoid');
var dice = require('../tools/dice');
var Damage = require('../rpg/damage');
var BarbedArrow = require('../rpg/weapons/arrow')['Barbed Arrow'];

var person = new Humanoid("Dude", {
    Strength        : dice.roll(3, 6).value,
    Perception      : dice.roll(3, 6).value,
    Endurance       : dice.roll(3, 6).value,
    Charisma        : dice.roll(3, 6).value,
    Intelligence    : dice.roll(3, 6).value,
    Agility         : dice.roll(3, 6).value,
    Luck            : dice.roll(3, 6).value,
    Willpower       : dice.roll(3, 6).value
})

var arrow = BarbedArrow.Damage(5);

person.Damage(arrow, "Left Leg");

// console.log(person);
var data = person.toData();
// console.log(data);
// console.log(person)


var person2 = new Humanoid();
person2.loadData(data);
console.log(person2.HitLocations['Left Leg'].Wounds);

