var util = require("util")

var MidiClock = require('./midiclock')
var ClockedTimeline = require('./lib/classes/clockedtimeline')
var LinkedList = require('./lib/classes/superlinkedlist').LinkedList
// var Sequencer = require('./midisequencer');
var Event = require('./midievent')
var RecordModes = require('./recordmodes')

// console.log(util.inspect(Sequencer, {showHidden:true, depth: 4}))

var Track = function(){

	ClockedTimeline.call(this);

	var self = this

	var _seq = null
	var _list = new LinkedList()

	var _recMode = RecordModes.OverDub

	self.Clock().on('position', function(pos) {
		_evtPointer = self.Cursor()
	})

	self.Events = function() {
		return _list
	}

	self.RecordMode = function(mode) {
		if (arguments.length) {
			_recMode = mode
		}
		return _recMode
	}

	self.Sequencer = function(seq) {
		if (!!seq /*&& seq instanceof Sequencer*/) {
			_seq = seq
		} 
		return _seq;
	}

	self.addEvent = function(evt) {
		var pos = self.Cursor()
		if (!!evt && self.Clock().isPlaying() && self.RecordMode() != RecordModes.Stop) {
			
			if (!(evt instanceof Event)) {
				evt = new Event(pos, evt)
			}
			if (!_list.Current) { 
				_list.Current = _list.push(evt)
			} else if (_list.Current.Value.Position < pos) {
				var curr = _list.Current
				while(!!curr && curr.Value.Position < pos) {
					curr = curr.Next
				}
				if (!curr) {
					_list.push(evt)
				} else {
					_list.insertBefore(curr, evt)
				}
			} else if (_list.Current.Value.Position > pos) {
				var curr = _list.Current
				while(!!curr && curr.Value.Position > pos) {
					curr = curr.Prev
				}
				if (!curr) {
					_list.unshift(evt)
				} else {
					_list.insertAfter(curr, evt)
				}
			}
		}
	}

	self.removeEvent = function() {
		_list.removeOne(_list.Current)
	}

	self.process = function() {
		var ret = []
		var evt = _list.Current
		var pos = self.Cursor()
		if (!evt && pos == 0) {
			evt = _list.Current = _list.First
		}
		if (self.length() - 1 < pos) {
			evt = _list.Current = null
		}
		
		while (!!evt && evt.Value.Position <= pos) {
			console.log(pos, evt.Value.Data)
			if (self.RecordMode() == RecordModes.Replace) {
				evt = evt.Next
				self.removeEvent()
			} else {
				ret.push(evt.Value.Data)
				_list.Current = evt = evt.Next
			}
		}

		console.log(pos, self.length())
		if (self.length() - 1 == pos) {
			_list.Current = null
			console.log("================================END OF TRACK======================")
		}
		
		return ret
	}

	var oldstart = self.start
	self.start = function() {
		_list.Current = _list.First
		oldstart()
	}
}

util.inherits(Track, ClockedTimeline)

module.exports = Track
