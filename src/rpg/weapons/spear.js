var weapon = require('./../weapon');
var Damage = require('./../damage');

var ShortSpear = weapon.ThrownWeapon.extend('ShortSpear', {
    init: function() {
        this.parent();
        this.Attack.Stab = function() {
            var dmg = dice.roll(1, 6, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
        this.Attack.Slice = function() {
            var dmg = dice.roll(1, 4, 0).value;
            return new Damage.Cut.Class(dmg);
        }
        this.Attack.Throw = function() {
            var dmg = dice.roll(2, 4, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
    },
    RangeIncrement: 20,
    Weight: 4
})

var Spear = weapon.ThrownWeapon.extend('Spear', {
    init: function() {
        this.parent();
        this.Attack.Stab = function() {
            var dmg = dice.roll(2, 4, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
        this.Attack.Slice = function() {
            var dmg = dice.roll(2, 3, 0).value;
            return new Damage.Cut.Class(dmg);
        }
        this.Attack.Throw = function() {
            var dmg = dice.roll(2, 6, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
    },
    RangeIncrement: 20,
    Weight: 6
})

var LongSpear = weapon.Weapon.extend('LongSpear', {
    init: function() {
        this.parent();
        this.Attack.Stab = function() {
            var dmg = dice.roll(3, 4, 0).value;
            return new Damage.Pierce.Class(dmg);
        }
        this.Attack.Slice = function() {
            var dmg = dice.roll(3, 3, 0).value;
            return new Damage.Cut.Class(dmg);
        }
    },
    Weight: 9
})

exports.ShortSpear = ShortSpear;
exports.Spear = Spear;
exports.LongSpear = LongSpear;
