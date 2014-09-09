var midi = require('midi');

// Set up a new input.
var input = new midi.input();
// Create a virtual input port.
input.openVirtualPort("Test Input1");

// Configure a callback.
input.on('message', function(deltaTime, message) {
    console.log('m:' + message + ' d:' + deltaTime);
});

var output = new midi.output();
output.openVirtualPort("Test Input1");

//========================================
var inPortCount = input.getPortCount()
var outPortCount = output.getPortCount()

console.log(!process.stdout.isTTY ? 'input'.bold() : 'input');
for (var i = 0; i < inPortCount; i++) {
  console.log(input.getPortName(i), i);
}
console.log();

console.log(!process.stdout.isTTY ? 'output'.bold() : 'output');
for (var i = 0; i < outPortCount; i++) {
  console.log(output.getPortName(i), i);
}
console.log();
//========================================


// A midi device "Test Input" is now available for other
// software to send messages to.

// ... receive MIDI messages ...


// Send a MIDI message.


setInterval(function() {
	output.sendMessage([144,64,127]);
	setTimeout(function() {
		output.sendMessage([128,64,64]);
	}, 200)
}, 5000)

	
//===================================
function close() { 
	// Close the port when done.
	output.closePort();

	// Close the port when done.
	input.closePort();
	process.exit(0); 
}
process.on('SIGINT', close);
process.on('SIGQUIT', close);