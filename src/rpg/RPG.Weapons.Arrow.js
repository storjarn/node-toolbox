var dice = require('../../tools/dice');
var Damage = require('./../damage');

exports['Standard Arrow'] = {
    Damage : function(modifier) {
        var dmg = dice.roll(2, 2, modifier).value;
        return new Damage.Pierce.Class(
            dmg,
            (function(){
                if (dmg > 3) {
                    return {Damage:dmg, Weapon:"Standard Arrow"}
                } else {
                    return null
                }
            })()
        )
    }
}

exports['Barbed Arrow'] = {
    Damage : function(modifier) {
        var dmg = dice.roll(2, 3, modifier).value;
        return new Damage.Pierce.Class(
            dmg,
            (function(){
                if (dmg > 3) {
                    return {Damage:dmg, Weapon:"Barbed Arrow"}
                } else {
                    return null
                }
            })()
        )
    }
}
