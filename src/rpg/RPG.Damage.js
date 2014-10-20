(function() {
    
    var Class = require('../base/Base.Class');

    var damageTypes = [
        'Blunt', 'Cut', 'Burn', 'Pierce', 'Freeze', 'Poison'
    ]

    var Damage = Class.extend('Damage', {
        init: function(value, shard, timestamp){
            this.parent();
            this.Value = value || 0;
            this.Shard = shard || null;
            this.Timestamp = timestamp || new Date().getTime();
        },
        trackInstances : false
    })

    Damage.Types = damageTypes;

    for (var i = 0; i < damageTypes.length; ++i) {
        var damageType = damageTypes[i];
        var damageClass = (function(damageType){
            return Damage.extend(
                damageType+'Damage',
                {
                    init: function(value, shard, timestamp) {
                        this.parent(value, shard, timestamp);
                        this.DamageType = damageType;
                    }
                }
            )
        })(damageType);
        Damage[damageType] = {
            Name: damageType,
            Class: damageClass
        }
    }

    module.exports = Damage;

})()