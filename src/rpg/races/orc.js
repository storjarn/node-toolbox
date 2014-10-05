var Class = require('../../class');
var Humanoid = require('../humanoid');
var dice = require('../../tools/dice');

var Orc = Humanoid.extend('Orc', {
    init : function(name) {
        var attributes = {
            Strength        : dice.roll(3, 6, 2).value,
            Perception      : dice.roll(3, 6).value,
            Endurance       : dice.roll(3, 6, 4).value,
            Charisma        : dice.roll(5, 4, -4).value,
            Intelligence    : dice.roll(3, 6, -2).value,
            Agility         : dice.roll(3, 6).value,
            Luck            : dice.roll(3, 6).value,
            Willpower       : dice.roll(3, 6).value
        }
        this.parent(name, attributes);
        this.Specializations.Melee.Axe = 5;
        this.Specializations.Melee.Sword = 10;
        this.Specializations.Melee.Spear = 5;
        this.Specializations.Melee.Knife = 10;
        this.Specializations.Melee.Shield = 15;
        this.Specializations.Science.Mineral = 5;
        this.Specializations.Craftsmanship.Armorsmithing = 15;
        this.Specializations.Craftsmanship.Bladesmithing = 15;
        this.Size = this.Size * 1.1;
    }
})

module.exports = Orc;
