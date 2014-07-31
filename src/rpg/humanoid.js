/**
 *
 */

var Character = require('./Character');

var Humanoid = RPG.Character.extend('Humanoid', {
    init : function(name, attributes){
        this.parent(name, attributes);
        this.LoadBodyDefinition(BodyConfiguration);

        this.toData = function() {
            var wounds = {
                "Head" : this.HitLocations.Head.Wounds,
                "Left Leg" : this.HitLocations['Left Leg'].Wounds,
                "Right Leg" : this.HitLocations["Right Leg"].Wounds,
                "Chest" : this.HitLocations.Chest.Wounds,
                "Abdomen" : this.HitLocations.Abdomen.Wounds,
                "Left Arm" : this.HitLocations['Left Arm'].Wounds,
                "Right Arm" : this.HitLocations['Right Arm'].Wounds
            }
            var ret = {
                Attributes : this.Attributes,
                Specializations : this.Specializations,
                Name : this.Name,
                Inventory : this.Inventory,
                Wounds : wounds
            }
            return ret
        }
    }
})

module.exports = Humanoid;

/**
    Hit Locations: d100 (for a standard humanoid morph)
    00-04 Head (~5%)
    05-14 Right Arm (~10%)
    15-39 Chest (~25%)
    40-49 Left Arm (~10%)
    50-69 Abdomen (~20%)
    70-84 Right Leg (~15%)
    85-99 Left Leg (~15%)
*/

var BodyConfiguration = {
    Locations : {
        "Head" : {
            "Health" : function() { return this.HitPoints() / 5 },
            "Percentage" : 5,
            "InventorySlots" : {
                "Hat" : null,
                "EyeWear" : null,
                "EarWear" : null,
                "NeckWear" : null
            }
        },
        "Right Arm" : {
            "Health" : function() { return this.HitPoints() / 4 },
            "Percentage" : 10,
            "InventorySlots" : {
                "ShoulderWear" : null,
                "UpperMidWear" : null,
                "ElbowWear" : null,
                "LowerMidWear" : null,
                "WristWear" : null,
                "Gloves" : null
            }
        },
        "Chest" : {
            "Health" : function() { return this.HitPoints() / 2 },
            "Percentage" : 25,
            "InventorySlots" : {
                "CollarWear" : null,
                "LeftBreastWear" : null,
                "RightBreastWear" : null,
                "BackWear" : null
            }
        },
        "Left Arm" : {
            "Health" : function() { return this.HitPoints() / 4 },
            "Percentage" : 10,
            "InventorySlots" : {
                "ShoulderWear" : null,
                "UpperMidWear" : null,
                "ElbowWear" : null,
                "LowerMidWear" : null,
                "WristWear" : null,
                "Gloves" : null
            }
        },
        "Abdomen" : {
            "Health" : function() { return this.HitPoints() / 3 },
            "Percentage" : 20,
            "InventorySlots" : {
                "PlexusWear" : null,
                "BellyWear" : null,
                "Belt" : null,
                "GroinWear" : null
            }
        },
        "Right Leg" : {
            "Health" : function() { return this.HitPoints() / 3 },
            "Percentage" : 15,
            "InventorySlots" : {
                "HipWear" : null,
                "UpperMidWear" : null,
                "KneeWear" : null,
                "LowerMidWear" : null,
                "AnkleWear" : null,
                "Feet" : null
            }
        },
        "Left Leg" : {
            "Health" : function() { return this.HitPoints() / 3 },
            "Percentage" : 15,
            "InventorySlots" : {
                "HipWear" : null,
                "UpperMidWear" : null,
                "KneeWear" : null,
                "LowerMidWear" : null,
                "AnkleWear" : null,
                "Feet" : null
            }
        }
    }
}
