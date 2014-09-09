
var MIDI_IO = function() {

    var self = this

    var midi = require('midi');

    // Set up a new input.
    var _input = new midi.input();

    // Set up a new output.
    var _output = new midi.output();


    var linkIO = function(deltaTime, msg) {
        _output.sendMessage(msg)
    }

    self.link = function() {
        _input.on('message', linkIO)
    }

    self.unlink = function() {
        _input.removeListener('message', linkIO)
    }

    self.onMessage = function(callback) {
        _input.on('message', callback)
    }
    

    self.Input = function() {
        return _input
    }

    self.openInput = function(index) {
        if (index > _input.getPortCount() - 1) return false
        _input.openPort(index)
        return true
    }

    self.openVirtualInput = function(name) {
        _input.openVirtualPort(name);
    }

    self.listInputs = function() {
        console.log('Input');
        for (var i = 0; i < _input.getPortCount(); i++) {
          console.log(_input.getPortName(i), i);
        }
        console.log();
    }


    self.Output = function() {
        return _output
    }

    self.openOutput = function(index) {
        if (index > _output.getPortCount() - 1) return false
        _output.openPort(index)
        return true
    }

    self.openVirtualOutput = function(name) {
        _output.openVirtualPort(name);
    }

    self.listOutputs = function() {
        console.log('Output');
        for (var i = 0; i < _output.getPortCount(); i++) {
          console.log(_output.getPortName(i), i);
        }
        console.log();
    }

    self.sendMessage = function(msg) {
        _output.sendMessage(msg)
    }

}

module.exports = MIDI_IO