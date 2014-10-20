var weapon = require('./../weapon');
var Damage = require('./../damage');

var ShortSword = weapon.Weapon.extend('ShortSword', {
    init: function() {
        this.parent();
        this.Attack.Stab = function() {
            var dmg = dice.roll(1, 4, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
        this.Attack.Slice = function() {
            var dmg = dice.roll(1, 6, 0).value;
            return new Damage.Cut.Class(dmg);
        }
    },
    Weight: 3
})

var LongSword = weapon.Weapon.extend('LongSword', {
    init: function() {
        this.parent();
        this.Attack.Stab = function() {
            var dmg = dice.roll(2, 3, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
        this.Attack.Slice = function() {
            var dmg = dice.roll(2, 4, 0).value;
            return new Damage.Cut.Class(dmg);
        }
    },
    Weight: 4
})

var GreatSword = weapon.Weapon.extend('GreatSword', {
    init: function() {
        this.parent();
        this.Attack.Stab = function() {
            var dmg = dice.roll(3, 3, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
        this.Attack.Slice = function() {
            var dmg = dice.roll(3, 4, 0).value;
            return new Damage.Cut.Class(dmg);
        }
    },
    Weight: 8
})

exports.ShortSword = ShortSword;
exports.LongSword = LongSword;
exports.GreatSword = GreatSword;
