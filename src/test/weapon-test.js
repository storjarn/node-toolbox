var Bow = require('../rpg/weapons/bow').Bow;
var Arrow = require('../rpg/weapons/arrow');

var myBow = new Bow();
var quiver = {
    "Standard Arrow" : {
        Count : 20,
        Damage : Arrow['Standard Arrow'].Damage
    }
}

console.log(myBow.toObject());
console.log(myBow.Attack.Melee());
while(quiver['Standard Arrow'].Count) {
    console.log(
        myBow.Attack.Shoot(quiver['Standard Arrow']).toObject()
    );
}
console.log(quiver)
