var weapon = require('./../weapon');
var Damage = require('./../damage');

var LightHammer = weapon.ThrownWeapon.extend('LightHammer', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var dmg = dice.roll(1, 4, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
        this.Attack.Throw = function() {
            var dmg = dice.roll(2, 2, 0).value;
            return new Damage.Blunt.Class( dmg );
        }
    },
    RangeIncrement: 10,
    Weight: 2
})

var Hammer = weapon.Weapon.extend('Hammer', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var dmg = dice.roll(2, 4, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
    },
    Weight: 5
})

var WarHammer = weapon.Weapon.extend('WarHammer', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var dmg = dice.roll(3, 4, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
    },
    Weight: 9
})

var GreatHammer = weapon.Weapon('GreatHammer', {
    init: function() {
        this.parent();
        this.Attack.Bash = function() {
            var dmg = dice.roll(3, 5, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
    },
    Weight: 15
})

exports.LightHammer = LightHammer;
exports.Hammer = Hammer;
exports.WarHammer = WarHammer;
exports.GreatHammer = GreatHammer;
