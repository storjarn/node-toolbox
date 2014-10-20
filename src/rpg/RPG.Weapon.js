/**
 *
 */

var Class = require('../class');
var dice = require('../tools/dice');

var defaultBluntAttack = function() {
    return new Damage.Blunt.Class(dice.roll(1, 3));
};

var Weapon = Class.extend('Weapon', {
    init: function() {
        this.Attack.Bash = defaultBluntAttack;
    },
    Attack : {},
    CriticalMultiplier : 1.5,
    Material : null,
    Weight: 0
})

var RangedWeapon = Weapon.extend('RangedWeapon', {
    init: function() {
        this.parent();
        this.MaxRange = this.RangeIncrement * 10;
        this.Attack.Shoot = function(ammunition) {
            if (ammunition && ammunition.Count) {
                --ammunition.Count;
                var bowDamage = dice.roll(1, 8, 0).value;
                return ammunition.Damage(bowDamage);
            } else {
                throw new Error('That ammunition type is incorrect!');
            }
        }
    },
    RangeIncrement: 20,
    MaxRange: 100
})


var ThrownWeapon = RangedWeapon.extend('ThrownWeapon', {
    init: function() {
        this.parent();
        this.MaxRange = this.RangeIncrement * 5;
        this.Attack.Throw = function() {
            var dmg = dice.roll(1, 4, 0).value;
            return new Damage.Blunt.Class(dmg);
        }
    }
})

exports.Weapon = Weapon;
exports.RangedWeapon = RangedWeapon;
exports.ThrownWeapon = ThrownWeapon;
