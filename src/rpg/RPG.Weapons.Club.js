var weapon = require('./../weapon');
var Damage = require('./../damage');

var Club = weapon.ThrownWeapon.extend('Club', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var dmg = dice.roll(1, 4, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
        this.Attack.Throw = function() {
            var dmg = dice.roll(1, 4, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
    },
    RangeIncrement: 10,
    Weight: 3
})

var Mace = weapon.Weapon.extend('Mace', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var dmg = dice.roll(2, 3, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
    },
    Weight: 4
})

var SpikedMace = weapon.Weapon.extend('SpikedMace', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var ret = [];
            var dmg = dice.roll(2, 3, 0).value;
            ret.push( new Damage.Blunt.Class(dmg) );
            dmg = dice.roll(1, 3, 0).value;
            ret.push( new Damage.Pierce.Class(dmg) );
        }
    },
    Weight: 5
})

var HeavyMace = weapon.Weapon.extend('HeavyMace', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var dmg = dice.roll(2, 4, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
    },
    Weight: 8
})

exports.Club = Club;
exports.Mace = Mace;
exports.SpikedMace = SpikedMace;
exports.HeavyMace = HeavyMace;
