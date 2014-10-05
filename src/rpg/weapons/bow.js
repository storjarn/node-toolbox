var weapon = require('./../weapon');

var Bow = weapon.RangedWeapon.extend('Bow', {
    init: function() {
        this.parent();
    },
    RangeIncrement: 30,
    Weight: 2.5
})

var ShortBow = Bow.extend('Short Bow', {
    init: function() {
        this.parent();
    },
    RangeIncrement: 20,
    Weight: 2
})

var LongBow = Bow.extend('Long Bow', {
    init: function() {
        this.parent();
    },
    RangeIncrement: 40,
    Weight: 3
})

exports.Bow = Bow;
exports.LongBow = LongBow;
exports.ShortBow = ShortBow;
