require('../../class');
var Humanoid = require('../humanoid');
var dice = require('../../tools/dice');

var Gnome = Humanoid.extend('Gnome', {
    init : function(name) {
        var attributes = {
            Strength        : dice.roll(3, 6, -2).value,
            Perception      : dice.roll(3, 6, 2).value,
            Endurance       : dice.roll(3, 6, 3).value,
            Charisma        : dice.roll(3, 6).value,
            Intelligence    : dice.roll(3, 6, 2).value,
            Agility         : dice.roll(3, 6).value,
            Luck            : dice.roll(4, 4, 4).value,
            Willpower       : dice.roll(3, 6, 2).value
        }
        this.parent(name, attributes);
        this.Specializations.Melee.Hammer = 10;
        this.Specializations.Science.Mineral = 20;
        this.Specializations.Science.General = 10;
        this.Specializations.Craftsmanship.General = 30;
        this.Specializations.Mechanics.General = 30;
        this.Specializations.Survival.Mountain = 10;
        this.Specializations.Stealth.General = 10;
        this.Specializations.Craftsmanship.Stonemasonry = 5;
        this.Size = this.Size * .6;
    }
})

module.exports = Dwarf;
