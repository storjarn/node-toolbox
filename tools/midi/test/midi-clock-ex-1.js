var MidiClock = require('../midiclock')
var midi = require('midi');

var output = new midi.output();
output.openVirtualPort("Test Input1");

var clock = new MidiClock({Tempo: 93})
var lastTime = 0;

clock.on('position', function(position){

	function logger(clock, position) {
		console.log('Tempo:', clock.getTempo(), 'Beat:', position / 24, 'Position:', clock.getPosition(), 'Running Time:', clock.getRunningTime(), 'Time Delta:', clock.getRunningTime() - lastTime)
		lastTime = clock.getRunningTime()
	}

	// log on each beat, ignore the rest
	var microPosition = position % 24

	if (microPosition === 0){
		console.log("===================Beat")
		logger(clock, position)
	} else {
		logger(clock, position)
	}

	output.sendMessage([248]);
})

clock.start()

setTimeout(function(){
  // change to 120bpm after 10 seconds
  clock.setTempo(60)
}, 10000)

setTimeout(function(){
  // change to 120bpm after 10 seconds
  clock.setTempo(120)
}, 15000)

setTimeout(function(){
  // change to 120bpm after 10 seconds
  clock.setTempo(300)
}, 21000)

//===================================
function close() { 
	process.exit(0); 
}
process.on('SIGINT', close);
process.on('SIGQUIT', close);