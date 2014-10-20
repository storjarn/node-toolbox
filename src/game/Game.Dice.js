(function(undefined){

    /**
     *
     */

    var utils = require('../utils');

    var Game = require('./Game')
    var Namespace = require('../base/Base.Namespace');

    var dice = {};

    var defaults = dice.defaults = {
        numberOfDie : 1,
        typeOfDie : 6,
        modifier : 0
    }

    var die = dice.die = {};
    for (var i = 2; i < 101; ++i) {
        die['d'+i] = utils.randomize(1, i);
    }

    var roll = dice.roll = function(numberOfDie, typeOfDie, modifier){
        numberOfDie = numberOfDie || defaults.numberOfDie;
        typeOfDie = typeOfDie || defaults.typeOfDie;
        modifier = modifier || defaults.modifier;

        var ret = {
            multiple: numberOfDie,
            typeOfDie : typeOfDie,
            modifier: modifier,
            rolls : [],
            value : 0
        };

        var roll = die['d' + typeOfDie];
        for(var i = 1; i < numberOfDie + 1; ++i) {
            var result = roll();
            ret.rolls.push(result);
            ret.value += result;
        }
        ret.value += modifier;
        ret.toString = function(base) {
            return ret.value.toString(base || 10)
        }
        ret.valueOf = function() {
            return ret.value
        }

        return ret;
    }

    var createRoll = dice.createRoll = function(numberOfDie, typeOfDie, modifier){
        numberOfDie = numberOfDie || defaults.numberOfDie;
        typeOfDie = typeOfDie || defaults.typeOfDie;
        modifier = modifier || defaults.modifier;

        return function() {
            return exports.roll(numberOfDie, typeOfDie, modifier);
        }
    }

    var parseString = dice.parseString = function(str) {
        if (!!str && str.indexOf('d') > -1) {
            var typeOfDice = str.split('d');
            var numberOfDice = typeOfDice[0];
            typeOfDice = typeOfDice[1];
            var modifier = 0;
            if (typeOfDice.indexOf('m') > -1) {
                modifier = typeOfDice.split('m');
                typeOfDice = modifier[0];
                if (modifier.length > 1) {
                    modifier = modifier[1];
                } else {
                    modifier = 0;
                }
                // console.log(modifier)
            }
            numberOfDice = parseInt(numberOfDice.toString());
            typeOfDice = parseInt(typeOfDice.toString());
            modifier = parseInt(modifier.toString());

            if (isNaN(numberOfDice)) {
                throw new Error("The number of dice is not a number!");
            } else if (isNaN(typeOfDice)) {
                throw new Error("The type of dice is not a number!");
            } else if (isNaN(modifier)) {
                throw new Error("The modifier is not a number!");
            } else {
                return dice.roll(numberOfDice, typeOfDice, modifier);
            }
        } else {
            throw new Error("usage: pass the number of dice, type of dice, and modifier like so: 2d6m-8\nexample: parseString('2d6m-8') or parseString('3d6')");
        }
    }

    var test = dice.test = function(diceSetup, iterations){

        iterations = iterations || 100;

        var results = {};
        var performance = new util.performance();

        for(var j = 0; j < diceSetup.length; ++j) {
            performance.start();

            var multiple = diceSetup[j][0] || defaults.numberOfDie;
            var die = diceSetup[j][1] || defaults.typeOfDie;
            var modifier = diceSetup[j][2] || defaults.modifier;
            console.log("Iterating "+iterations+" times over "+ multiple + 'd' + die + '+' + modifier);
            for (var i = 0; i < iterations; ++i) {
                var result = exports.roll(multiple, die, modifier);
                if (!results[result.value.toString()]) {
                    results[result.value.toString()] = 0;
                }
                ++(results[result.value.toString()]);
            }
            console.log(results);
            results = {};
            console.log('This test took ' + performance.end('ms') + ' ms.')
        }
    }

    var Dice = new Namespace("Dice", Game, dice);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Dice;
    } else {
        this.Dice = Dice;
    }
})();
