var EventEmitter = require('events').EventEmitter

var Ticker = function(audioContext){

	var ticker = new EventEmitter()

	var pos = 0
	var length = 24

	var time = ticker.time = function time(){
		if (audioContext){
			return audioContext.currentTime * 1000
		} else if (global.process && process.hrtime) {
		  var t = process.hrtime()
		  return (t[0] + (t[1] / Math.pow(10, 9))) * 1000
		} else {
		  return Date.now()
		}
	}

	function tick(){
		if (!pos){
		  pos = time()
		}; 
		pos += length; 
		var diff = pos - time()
		ticker.emit('tick')
		setTimeout(tick, diff)
	}

	ticker.setInterval = function(tempo){
		length = parseInt(tempo.toString()) || 24
		// console.log('ticker interval length:', length)
	}

	tick()

	return ticker
}



var Clock = function(options){

	options = options || {}

	var MICROSECONDS_PER_MINUTE = 60000000;

	var clock = new EventEmitter()
	var ticker = Ticker(options.context)
	clock.IO = null
	clock.isMaster = false

	var state = {
		tempo: 120,
		ppq: 24,

		beatDivision: 4/4,

		tickLength: 24,

		nextTickAt: 0,
		position: 0,

		playing: false,

		startTime: 0,
		runningTime: 0
	}

	var prevState = state

	if (options.Tempo) state.tempo = options.Tempo;
	// if (options.PPQ) state.ppq = options.PPQ;

	ticker.on('tick', function(){
		if (state.playing){
			clock.advance(1)
			state.runningTime = new Date().getTime() - state.startTime
			// state.nextTickAt = 0
			if (!!clock.IO && !!clock.isMaster) {
				clock.IO.sendMessage([248])
			}
		}
	})

  	function ticksPerMinute() {
		return state.tempo * state.ppq;
	}
	function tickLength() {
		return 60000 / ticksPerMinute()
	}
	function ticksPerMillisecond() {
		return ticksPerMinute() * 1/60000
	}
	function secondsPassed(ticks) {
		return (60 * ticks) / ticksPerMinute()
	}
	function microsecondsPerQuarterNote() {
		return MICROSECONDS_PER_MINUTE / state.tempo;
	}
	function updateTicker() {
		state.tickLength = tickLength()
		ticker.setInterval(state.tickLength)
	}

	// clock.getPPQ = function() {
	// 	return state.ppq;
	// }

	// clock.setPPQ = function(ppq) {
	// 	state.ppq = ppq;
	// 	updateTicker()
	// }

	clock.advance = function(n) {
		n = n || 1
		clock.setPosition( state.position + n )
	}

	clock.getPosition = function() {
		return state.position;
	}

	clock.setPosition = function(pos) {
		state.position = pos;
		clock.emit('position', state.position)
		// state.runningTime = 
	}

	clock.getRunningTime = function() {
		return state.runningTime;
	}

	clock.getStartTime = function() {
		return state.startTime;
	}

	clock.getTempo = function() {
		return state.tempo;
	}

	clock.setTempo = function(tempo){
		state.tempo = tempo;
		updateTicker()
		clock.emit('tempo', tempo)
	}

	clock.isPlaying = function() {
		return state.playing
	}

	clock.start = function(){
		clock.setTempo(state.tempo);
		state.startTime = new Date().getTime()
		state.nextTickAt = 0
		clock.setPosition( -1 )
		clock.emit('start')
		state.playing = true
		if (!!clock.IO && !!clock.isMaster) {
			clock.IO.sendMessage([250])
		}
	}

	clock.resume = function(){
		clock.setTempo(state.tempo);
		clock.emit('resume')
		state.playing = true
		if (!!clock.IO && !!clock.isMaster) {
			clock.IO.sendMessage([251])
		}
	}

	clock.stop = function(){
		state.runningTime = state.startTime = 0
		clock.emit('stop')
		state.playing = false
		if (!!clock.IO && !!clock.isMaster) {
			clock.IO.sendMessage([252])
		}
	}

	clock.synchronize = function(masterClock) {
		if (!!masterClock /*&& masterClock instanceof Clock*/) {

			prevState = state

			clock.Master = masterClock
			
			clock.setPosition(masterClock.getPosition())
			state.runningTime = masterClock.getRunningTime()
			state.startTime = masterClock.getStartTime()
			clock.setTempo(masterClock.getTempo())

			clock.Master.on('start', clock.start)
			clock.Master.on('resume', clock.resume)
			clock.Master.on('stop', clock.stop)
			clock.Master.on('tempo', clock.setTempo)
			clock.Master.on('position', clock.setPosition)
		} 
	}

	clock.unsynchronize = function() {
		if(!!clock.Master /*&& masterClock instanceof Clock*/) {
			clock.Master.removeListener('start', clock.start)
			clock.Master.removeListener('start', clock.resume)
			clock.Master.removeListener('start', clock.stop)
			clock.Master.removeListener('tempo', clock.setTempo)
			clock.Master.removeListener('position', clock.setPosition)

			clock.Master = null
			state = prevState
			
			clock.setPosition(state.playing ? state.position : -1)
			state.runningTime = state.playing ? state.runningTime : 0
			state.startTime = state.playing ? new Date().getTime() : 0
			clock.setTempo(state.tempo)
		}
	}

  	return clock
}

module.exports = Clock;