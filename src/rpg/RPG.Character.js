/**
 */

(function(){

	var Body = require('./RPG.Body');
	var Damage = require('./RPG.Damage');

	var attributeDefaults = {
		Strength: 9,
		Perception: 9,
		Endurance: 9,
		Charisma: 9,
		Intelligence: 9,
		Agility: 9,
		Luck: 9,
		Willpower: 9
	}

	var Character = Body.extend('Character', {
		init: function(name, attributes){

			var self = this;

			this.parent();
			this.LoadBodyDefinition(BodyConfiguration);

			this.Name = name || "";
			this.Attributes = attributes || attributeDefaults;

			this.Size = (function(){
				return (self.Attributes.Strength + self.Attributes.Endurance) / 2
			})();

			this.Spirit = function(){
				return (self.Attributes.Luck / 2) + self.Attributes.Willpower + (self.Attributes.Intelligence / 2) + self.Attributes.Perception
			};
			this.Sanity = function(){
				return (self.Attributes.Willpower + self.Attributes.Luck) * 4 - self.Attributes.Perception
			};
			this.HitPoints = function(){
				return 15 + self.Attributes.Strength + (self.Attributes.Endurance * 2)
			};

			this.MovementSpeed = function(){ 	//in feet per 1 second
				return Math.max(1 + self.Attributes.Agility - self.CurrentDamage(), 0);
			};
			this.AttackSpeed = function() {		//In half seconds
				return Math.max(20 - self.Attributes.Agility + self.CurrentDamage(), 1);
			};

			this.MaxCarryWeight = function(){return 12 * self.Attributes.Strength};

			/**
				"Leather Jerkin" : {
					Weight: 3,
					Warmth: 5,
					Slots: 7,
					Armor : {
						Value : 5,
						"Blunt" : .2,
						"Cut" : .4,
						"Burn" : .7,
						"Pierce" : .2,
						"Freeze" : .3,
						"Poison" : .9
					}
				}
			*/

			this.Skills = {
				"Firearms" : function(){
					return self.Attributes.Agility + 10
				},
				"Archery" : function(){
					return 2 + (self.Attributes.Agility * 2) + (self.Attributes.Strength / 2)
				},
				"Explosives" : function(){
					return 2 + (self.Attributes.Perception * 2) + (self.Attributes.Luck / 2)
				},
				"Melee" : function(){
					return 30 + (2 * self.Attributes.Agility) + (2 * self.Attributes.Strength)
				},
				"Throwing" : function(){
					return 4 * self.Attributes.Agility
				},
				"Lockpick" : function(){
					return 20 + (self.Attributes.Perception / 2) + (self.Attributes.Agility / 2)
				},
				"Mechanics" : function(){
					return 20 + self.Attributes.Intelligence
				},
				"Medicine" : function(){
					return 2 + (self.Attributes.Intelligence * 2) + (self.Attributes.Luck / 2)
				},
				"Science" : function(){
					return 2 + (self.Attributes.Intelligence * 2) + (self.Attributes.Luck / 2)
				},
				"Craftsmanship" : function(){
					return (self.Attributes.Intelligence / 2) + (self.Attributes.Luck / 2) + (self.Attributes.Perception / 2) + (self.Attributes.Agility / 2)
				},
				"Stealth" : function(){
					return 2 + (self.Attributes.Agility * 2) + (self.Attributes.Luck / 2)
				},
				"Survival" : function(){
					return 2 + self.Attributes.Endurance + self.Attributes.Intelligence + (self.Attributes.Luck / 2)
				},
				"Barter" : function(){
					return 2 + (self.Attributes.Charisma * 2) + (self.Attributes.Luck / 2)
				},
				"Speech" : function(){
					return 2 + (self.Attributes.Charisma * 2) + (self.Attributes.Luck / 2)
				},
				"Athletics" : function(){
					return 2 + self.Attributes.Agility + self.Attributes.Strength + (self.Attributes.Endurance / 2)
				},
				"History" : function(){
					return 2 + (self.Attributes.Intelligence * 2) + (self.Attributes.Perception / 2)
				}
			}
			this.Specializations = {
				"Firearms" : {
					"General" : 0,
					"Pistol" : -10,
					"Submachine Gun" : -15,
					"Rifle" : -5,
					"Machine Gun" : -15
				},
				"Archery" : {
					"General" : -10,
					"Bow" : -10,
					"Crossbow" : -5
				},
				"Explosives" : {
					"General" : -20
				},
				"Melee" : {
					"General" : 0,
					"Shield" : -10,
					"Spear" : -15,
					"Knife" : -5,
					"Sword" : -10,
					"Axe" : -15,
					"Hammer" : -10,
					"Kung Fu" : -35
				},
				"Throwing" : {
					"General" : 0,
					"Spear" : -20,
					"Knife" : -10,
					"Axe" : -20
				},
				"Lockpick" : {
					"General" : 0
				},
				"Mechanics" : {
					"General" : 0,
					"Combustion" : -10,
					"Hydraulic" : -20
				},
				"Medicine" : {
					"General" : 0,
					"First Aid" : -5
				},
				"Science" : {
					"General" : 0,
					"Botany" : -10,
					"Mineral" : -15,
					"Electronic" : -20,
					"Computer" : -10,
					"Physics" : -10,
					"Nuclear" : -35,
					"Rocket" : -50
				},
				"Craftsmanship" : {
					"General" : 0,
					"Boatsmithing" : -20,
					"Leathersmithing" : 0,
					"Armorsmithing" : -10,
					"Bladesmithing" : -15,
					"Gemsmithing" : -25,
					"Blacksmithing" : -10,
					"Furrier" : -5,
					"Dyeing" : 0,
					"Coopersmithing" : -5,
					"Goldsmithing" : -15,
					"Gunsmithing" : -20,
					"Locksmithing" : -20,
					"Pottersmithing" : -5,
					"Ropesmithing" : -5,
					"Stonemasonry" : -10,
					"Weaving" : -5,
					"Carpentry" : 0
				},
				"Stealth" : {
					"General" : 0,
					"Steal" : -10,
					"Sneak" : -5
				},
				"Survival" : {
					"General" : 0,
					"Forest" : -5,
					"Desert" : -20,
					"Island" : -30,
					"Mountain" : -5
				},
				"Barter" : {
					"General" : 0
				},
				"Speech" : {
					"General" : 0,
					"Persuasion" : -10
				},
				"Piloting" : {
					"General" : 0,
					"Boat" : -10,
					"Aircraft" : -30,
					"Automobile" : -5
				},
				"Athletics" : {
					"General" : 0,
					"Jump" : -5,
					"Climb" : -10,
					"Ride" : -10,
					"Swim" : -20
				},
				"History" : {
					"General" : 0
				}
			}

			this.toData = function() {
				var wounds = {
					"Body" : this.HitLocations.Body.Wounds
				}
				var ret = {
					Attributes : this.Attributes,
					Specializations : this.Specializations,
					Name : this.Name,
					Inventory : this.Inventory,
					Wounds : wounds
				}
				// console.log(ret)
				return ret
			}

			this.loadData = function(data) {
				// console.log(data.Wounds['Left Leg']);
				if (data.Wounds) {
					for(var location in data.Wounds) {
						for (var i = 0; i < data.Wounds[location].length; ++i) {
							var wound = data.Wounds[location][i];
							var damage = new Damage[wound.DamageType].Class(wound.Value, wound.Shard, wound.Timestamp);
							this.HitLocations[location].Wounds.push(damage);
						}
					}
					delete data['Wounds'];
				}
				this.bind(data);
			}
		}
	});

	/**
	    Hit Locations: d100 (for a standard humanoid morph)
	    00-99 Body (~100%)
	*/

	var BodyConfiguration = {
	    Locations : {
	        "Body" : {
	            "Health" : function() { return this.HitPoints() },
	            "Percentage" : 100,
	            "InventorySlots" : {}
	        }
	    }
	}

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Character;
    } else {
        this.Character = Character;
    }
})();
