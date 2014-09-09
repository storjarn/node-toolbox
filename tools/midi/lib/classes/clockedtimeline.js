var util = require("util");
var events = require("events");

var MidiClock = require('../../midiclock');

var ClockedTimeline = function(){

	events.EventEmitter.call(this);

	var self = this;

	var _clock = new MidiClock();

	var _loop = false

	var _length = 0
	var _cursor = 0
	var _offset = 0

	self.Clock = function() {
		return _clock
	}

	self.setOffset = function(pos) {
		_offset = pos
	}

	self.getOffset = function() {
		return _offset
	}

	self.Cursor = function() {
		_cursor = Math.max(self.Clock().getPosition() - _offset, 0)
		// console.log(_length)
		if (self.loop() && _length > 0) {
			_cursor = _cursor % _length
		}
		return _cursor
	}

	self.loop = function(bLoop) {
		if (arguments.length) {
			_loop = bLoop
		}
		return _loop
	}

	self.length = function(len) {
		if (arguments.length) {
			_length = len
		}
		return _length
	}

	self.start = function() {

		if (!!self.Clock() /*&& self.Clock() instanceof MidiClock*/) {
			self.Clock().start()
			self.emit("start", self)
		}
	}

	self.stop = function() {
		if (!!self.Clock() /*&& self.Clock() instanceof MidiClock*/) {
			self.Clock().stop()
			self.emit("stop", self)
		}
	}

	self.resume = function() {
		if (!!self.Clock() /*&& self.Clock() instanceof MidiClock*/) {
			self.Clock().resume()
			self.emit("resume", self)
		}
	}

	self.setTempo = function(tempo) {
		if (!!self.Clock() /*&& self.Clock() instanceof MidiClock*/) {
			self.Clock().setTempo(tempo)
			self.emit("tempo", tempo)
		}
	}

	self.setPosition = function(pos) {
		if (!!self.Clock() /*&& self.Clock() instanceof MidiClock*/) {
			self.Clock().setPosition(pos)
			self.emit("position", pos)
		}
	}

	self.advance = function(n) {
		self.Clock().advance(n)
		return self.Cursor()
	}
}

util.inherits(ClockedTimeline, events.EventEmitter);

module.exports = ClockedTimeline