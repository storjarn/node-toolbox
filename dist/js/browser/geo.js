(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(context, undefined){

    // var utils = require('../utils');

    var Locations = {
        '35.8919224' : {
            '-106.2900411' : {
                Name        : 'Los Alamos, NM',
                WikiUrl     : "http://en.wikipedia.org/wiki/Los_Alamos,_New_Mexico",
                Elevation   : 7320   //ft
            }
        }
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Locations;
    } else {
        this.Locations = Locations;
    }
})(this);

},{}],2:[function(require,module,exports){
(function(context, undefined){

    // var utils = require('../utils');

    var locations = require('./locations');

    var World = {
        Circumference : 24901.55,        //miles
        Degrees : 360,
        Locations : locations
    }

    console.log(World);

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = World;
    } else {
        this.World = World;
    }
})(this);

},{"./locations":1}]},{},[1,2]);
