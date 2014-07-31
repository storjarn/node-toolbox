require('../../class');
var Humanoid = require('../humanoid');
var dice = require('../../tools/dice');

var Elf = Humanoid.extend('Elf', {
    init : function(name) {
        var attributes = {
            Strength        : dice.roll(3, 6, -2).value,
            Perception      : dice.roll(3, 6, 2).value,
            Endurance       : dice.roll(5, 4, -4).value,
            Charisma        : dice.roll(3, 6).value,
            Intelligence    : dice.roll(3, 6).value,
            Agility         : dice.roll(3, 6, 3).value,
            Luck            : dice.roll(3, 6).value,
            Willpower       : dice.roll(3, 6, 2).value
        }
        this.parent(name, attributes);
        this.Specializations.Archery.Bow = 20;
        this.Specializations.Survival.Forest = 15;
        this.Specializations.Medicine.General = 15;
        this.Specializations.Science.Botany = 15;
        this.Specializations.Craftsmanship.General = 15;
        this.Specializations.History.General = 15;
        this.Specializations.Athletics.General = 15;
        this.Size = this.Size * .9;
    }
})

module.exports = Elf;
