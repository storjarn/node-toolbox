var weapon = require('./../weapon');
var Damage = require('./../damage');

var ThrowingAxe = weapon.ThrownWeapon.extend('ThrowingAxe', {
    init: function() {
        this.parent();
        this.Attack.Slice = function() {
            var dmg = dice.roll(1, 4, 0).value;
            return new Damage.Cut.Class(dmg);
        }
        this.Attack.Throw = function() {
            var dmg = dice.roll(2, 2, 0).value;
            return new Damage.Cut.Class(
                dmg,
                (function(){
                    if (dmg > 3) {
                        return {Damage:dmg, Weapon:"ThrowingAxe"}
                    } else {
                        return null
                    }
                })()
            );
        }
    },
    RangeIncrement: 10,
    Weight: 2
})

var HandAxe = weapon.ThrownWeapon.extend('HandAxe', {
    init: function() {
        this.parent();
        this.Attack.Slice = function() {
            var dmg = dice.roll(2, 3, 0).value;
            return new Damage.Cut.Class(dmg);
        }
        this.Attack.Throw = function() {
            var dmg = dice.roll(2, 4, 0).value;
            return new Damage.Cut.Class(
                dmg,
                (function(){
                    if (dmg > 3) {
                        return {Damage:dmg, Weapon:"HandAxe"}
                    } else {
                        return null
                    }
                })()
            );
        }
    },
    RangeIncrement: 10,
    Weight: 3
})

var WarAxe = weapon.Weapon.extend('WarAxe', {
    init: function() {
        this.parent();
        this.Attack.Slice = function() {
            var dmg = dice.roll(3, 3, 0).value;
            return new Damage.Cut.Class(dmg);
        }
    },
    Weight: 6
})

var BattleAxe = weapon.Weapon.extend('BattleAxe', {
    init: function() {
        this.parent();
        this.Attack.Slice = function() {
            var dmg = dice.roll(3, 4, 0).value;
            return new Damage.Cut.Class(dmg);
        }
    },
    Weight: 9
})

var GreatAxe = weapon.Weapon.extend('GreatAxe', {
    init: function() {
        this.parent();
        this.Attack.Slice = function() {
            var dmg = dice.roll(3, 5, 0).value;
            return new Damage.Cut.Class(dmg);
        }
    },
    Weight: 15
})

exports.ThrowingAxe = ThrowingAxe;
exports.HandAxe = HandAxe;
exports.WarAxe = WarAxe;
exports.BattleAxe = BattleAxe;
exports.GreatAxe = GreatAxe;
