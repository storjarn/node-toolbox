/**
 *
 */

require('../class');

var Body = Class.extend('Body', {
    init : function(){
        this.parent();

        this.CurrentDamage = function() {
            var dmg = 0;
            for (var loc in this.HitLocations) {
                for (var i = 0; i < this.HitLocations[loc].Wounds.length; ++i) {
                    dmg += this.HitLocations[loc].Wounds[i].Value;
                }
            }
            return dmg;
        };

        this.Damage = function(wound, location) {
            var armor = null;
            var origValue = wound.Value;
            for (var itemName in this.Inventory[location]) {
                if (!!this.Inventory[location][itemName] && !!this.Inventory[location][itemName].Armor) {
                    armor = this.Inventory[location][itemName].Armor;
                    Wound.Value -= (armor[wound.DamageType] || 0) * (armor.Value || 0);
                }
            }
            if (wound.Value < 1) {
                wound = null;
            } else if (origValue / 2 > wound.Value) {
                wound.DamageType = "Blunt";
                wound.Shard = null;
            }
            if (!!wound) {
                this.HitLocations[location].Wounds.push(wound);
            }
        };
    },
    LoadBodyDefinition : function(configuration){
        var self = this;

        this.HitLocations = {};
        this.Inventory = {};

        var lookupIndex = 0;
        var lastIndex = 0;

        for(var key in configuration.Locations) {
            var location = configuration.Locations[key];
            this.HitLocations[key] = {
                Health : (function(location){
                    return function() {
                        return location.Health.apply(self);
                    }
                })(location),
                Wounds : []
            };
            this.Inventory[key] = location.InventorySlots;
            for(; lookupIndex < (lastIndex + location.Percentage); ++lookupIndex) {
                this.LocationLookup[lookupIndex.toString()] = key;
            }
            lastIndex = lookupIndex;
        }

        // console.log(self.HitLocations);
    },
    HitLocations : {},
    Inventory : {},
    LocationLookup : {},
    LookupLocation : function(index) {
        var bodyLocation = this.LocationLookup[index.toString()];
        return this.HitLocations[bodyLocation];
    },
    toData : function() {
        return {
            Inventory : this.Inventory
        }
    }
});

module.exports = Body;
