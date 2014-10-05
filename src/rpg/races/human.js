var Class = require('../../class');
var Humanoid = require('../humanoid');

var Human = Humanoid.extend('Human', {
    init : function(name, attributes) {
        attributes = attributes || {
            Strength        : dice.roll(3, 6).value,
            Perception      : dice.roll(3, 6).value,
            Endurance       : dice.roll(3, 6).value,
            Charisma        : dice.roll(3, 6).value,
            Intelligence    : dice.roll(3, 6).value,
            Agility         : dice.roll(3, 6).value,
            Luck            : dice.roll(3, 6).value,
            Willpower       : dice.roll(3, 6).value
        }
        this.parent(name, attributes);
    }
})

module.exports = Human;
