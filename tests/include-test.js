require('../include')

var now = new Date().getTime()

include('Class')
var test = Class.extend('test', {init:function(){}}, {isFinal: true})
console.log( test + "" )  //toString() test
console.log( new test() + "" )  //toString() test
console.log( test )   //static props test
console.log( test.Instances[0] + "" )   //static props test
console.log( test.ClassName )   //static props test
console.log( test.ParentType.ClassName )   //static props test

var Dice = include('Game.Dice')
console.log( Dice.roll().value )
console.log( Dice.roll(3, 6, 5) )
console.log( Dice.roll(3, 6) + 5 )

var System = include('System')
include('System.Utility')
include('System.Resources.Strings')

console.log( System.Utility.getFullyQualifiedName() )
console.log( System.Resources.Strings.Dot )

console.log('Execution time:', new Date().getTime() - now, 'ms')