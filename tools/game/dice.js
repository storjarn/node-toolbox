#!/usr/bin/env node

var Console = new (require('./../../src/tools/Console.js'))();
var dice = require('./../src/game/Game.Dice');

Console.InputHandlers.StdIn = {
    Start : function(data) {
        if (Console.Arguments.length && Console.Arguments[0].indexOf('d') > -1) {
            try {
                console.log(dice.parseString(Console.Arguments[0]).value)
            } catch(ex) {
                console.log(ex.message);
                Console.ShowHelp();
            }
        } else {
            Console.ShowHelp();
        }
        Console.Exit();
    }
};

Console.HelpText = "usage: pass the number of dice, type of dice, and modifier like so: 2d6m-8\nexample: dice 2d6m-8 or dice 3d6";

Console.Run();


