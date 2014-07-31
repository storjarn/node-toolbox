var dice = require('../tools/dice');

var iterations = 100;
var diceSetup = [
    // [2, 6, 3],
    // [1, 100, 0],
    // [1, 20, 0],
    // [3, 6, 0],
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 2]
];

dice.test(diceSetup, iterations);

// console.log(dice.roll(3, 6, 2));

// console.log(dice);

