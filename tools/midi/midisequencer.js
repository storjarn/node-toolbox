var util = require("util");

var Track = require('./miditrack');
var ClockedTimeline = require('./lib/classes/clockedtimeline');
var ClockGuides = require('./clockguides')

var Sequencer = function(io){

    ClockedTimeline.call(this)

	var self = this

	var Tracks = self.Tracks = []
	self.IO = null

	self.Clock().isMaster = true

	self.Clock().on('position', function(pos) {
		// console.log('Sequencer', pos)
		for(var i = 0; i < Tracks.length; ++i) {
			var data = Tracks[i].process()
			if (!!self.IO) {
				for(var j = 0; j < data.length; ++j) {
					self.IO.sendMessage(data[j])
				}
			}
			// console.log(pos, data)
		}
	})

	self.setIO = function(io) {
		self.IO = self.Clock().IO = io
	}

	if (!!io) {
		self.setIO(io)
	}

	self.length = function() {
		var ret = 0;
		for(var i = 0; i < Tracks.length; ++i) {
			var tmp = Tracks[i].getOffset() + Tracks[i].length()
			if (tmp > ret) {
				ret = tmp
			}
		}
		return ret
	}

	self.getTrack = function(index) {
		return Tracks.length > index ? Tracks[index] : null
	}

	self.newTrack = function(length, offset) {
		var track = new Track()
		Tracks.push(track)
		track.Sequencer(self)
		track.length(length || ClockGuides.bar)
		track.setOffset(offset || 0)
		track.Clock().synchronize(self.Clock())
		return track
	}

	var start = self.start,
		stop = self.stop,
		resume = self.resume;

	self.start = function() {
		start()
		for(var i = 0; i < Tracks.length; ++i) {
			Tracks[i].start()
		}
	}
	self.stop = function() {
		stop()
		for(var i = 0; i < Tracks.length; ++i) {
			Tracks[i].stop()
		}
	}
	self.resume = function() {
		resume()
		for(var i = 0; i < Tracks.length; ++i) {
			Tracks[i].resume()
		}
	}
}

util.inherits(Sequencer, ClockedTimeline)

// console.log(Sequencer)

module.exports = Sequencer