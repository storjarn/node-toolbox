(function(undefined){

    function newCharacter() {
        return {
            Name : '',
            Age : 18,
            ExtraAttributePoints : 96,
            Attributes : {
                Strength: 9,
                Perception: 9,
                Endurance: 9,
                Charisma: 9,
                Intelligence: 9,
                Agility: 9,
                Luck: 9,
                Willpower: 9
            },
            HitPoints : function(){
                return 15 + this.Attributes.Strength + (this.Attributes.Endurance * 2)
            },
            Size : function(){
                return (this.Attributes.Strength + this.Attributes.Endurance) / 2
            },
            MovementSpeed : function(){    //in feet per 1 second
                return Math.max(1 + this.Attributes.Agility - this.CurrentDamage(), 0);
            },
            MaxCarryWeight : function(){
                return 12 * this.Attributes.Strength
            },
            Spirit : function(){
                return (this.Attributes.Luck / 2) + this.Attributes.Willpower + (this.Attributes.Intelligence / 2) + this.Attributes.Perception
            },
            Sanity : function(){
                return (this.Attributes.Willpower + this.Attributes.Luck) * 4 - this.Attributes.Perception
            },
            AttackSpeed : function() {     //In half seconds
                return Math.max(20 - this.Attributes.Agility + this.CurrentDamage(), 1);
            },
            Skills : {
                "Firearms" : function(){
                    return CreationCharacter.Attributes.Agility + 10
                },
                "Archery" : function(){
                    return 2 + (CreationCharacter.Attributes.Agility * 2) + (CreationCharacter.Attributes.Strength / 2)
                },
                "Explosives" : function(){
                    return 2 + (CreationCharacter.Attributes.Perception * 2) + (CreationCharacter.Attributes.Luck / 2)
                },
                "Melee" : function(){
                    return 30 + (2 * CreationCharacter.Attributes.Agility) + (2 * CreationCharacter.Attributes.Strength)
                },
                "Throwing" : function(){
                    return 4 * CreationCharacter.Attributes.Agility
                },
                "Lockpick" : function(){
                    return 20 + (CreationCharacter.Attributes.Perception / 2) + (CreationCharacter.Attributes.Agility / 2)
                },
                "Mechanics" : function(){
                    return 20 + CreationCharacter.Attributes.Intelligence
                },
                "Medicine" : function(){
                    return 2 + (CreationCharacter.Attributes.Intelligence * 2) + (CreationCharacter.Attributes.Luck / 2)
                },
                "Science" : function(){
                    return 2 + (CreationCharacter.Attributes.Intelligence * 2) + (CreationCharacter.Attributes.Luck / 2)
                },
                "Craftsmanship" : function(){
                    return (CreationCharacter.Attributes.Intelligence / 2) + (CreationCharacter.Attributes.Luck / 2) + (CreationCharacter.Attributes.Perception / 2) + (CreationCharacter.Attributes.Agility / 2)
                },
                "Stealth" : function(){
                    return 2 + (CreationCharacter.Attributes.Agility * 2) + (CreationCharacter.Attributes.Luck / 2)
                },
                "Survival" : function(){
                    return 2 + CreationCharacter.Attributes.Endurance + CreationCharacter.Attributes.Intelligence + (CreationCharacter.Attributes.Luck / 2)
                },
                "Barter" : function(){
                    return 2 + (CreationCharacter.Attributes.Charisma * 2) + (CreationCharacter.Attributes.Luck / 2)
                },
                "Speech" : function(){
                    return 2 + (CreationCharacter.Attributes.Charisma * 2) + (CreationCharacter.Attributes.Luck / 2)
                },
                "Athletics" : function(){
                    return 2 + CreationCharacter.Attributes.Agility + CreationCharacter.Attributes.Strength + (CreationCharacter.Attributes.Endurance / 2)
                },
                "History" : function(){
                    return 2 + (CreationCharacter.Attributes.Intelligence * 2) + (CreationCharacter.Attributes.Perception / 2)
                }
            },
            Specializations : {
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
        }
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        exports.newCharacter = newCharacter;
    } else {
        this.newCharacter = newCharacter;
    }
})();
