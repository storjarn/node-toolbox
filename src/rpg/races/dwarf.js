require('../../class');
var Humanoid = require('../humanoid');
var dice = require('../../tools/dice');

var Dwarf = Humanoid.extend('Dwarf', {
    init : function(name) {
        var attributes = {
            Strength        : dice.roll(3, 6, 2).value,
            Perception      : dice.roll(3, 6, -2).value,
            Endurance       : dice.roll(3, 6, 4).value,
            Charisma        : dice.roll(3, 6, -2).value,
            Intelligence    : dice.roll(3, 6).value,
            Agility         : dice.roll(3, 6).value,
            Luck            : dice.roll(4, 4, 2).value,
            Willpower       : dice.roll(3, 6).value
        }
        this.parent(name, attributes);
        this.Specializations.Melee.Axe = 10;
        this.Specializations.Throwing.Axe = 10;
        this.Specializations.Melee.Hammer = 5;
        this.Specializations.Melee.Shield = 10;
        this.Specializations.Science.Mineral = 10;
        this.Specializations.Survival.Mountain = 20;
        this.Specializations.Explosives.General = 0;
        this.Specializations.Craftsmanship.General = 20;
        this.Specializations.Craftsmanship.Stonemasonry = 15;
        this.Size = this.Size * .75;
    }
})

module.exports = Dwarf;
