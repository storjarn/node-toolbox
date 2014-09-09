var util = require("util");
var Seq = require('../midisequencer')
var IO = require('../midiio')

var RecordModes = require('../recordmodes')
var ClockGuides = require('../clockguides')

// console.log(util.inspect(Seq, {showHidden:true, depth: 4}))

var seq = new Seq( new IO() )
seq.setTempo(30)

seq.IO.openVirtualInput('Test Input')
seq.IO.openVirtualOutput('Test Output')
seq.IO.link()
// console.log(util.inspect(seq, {showHidden:true, depth: 4}))

var track = seq.newTrack(ClockGuides.bar * 1, 30)
track.loop(true)
// track.length(ClockGuides.bar * 3)
track.RecordMode(RecordModes.OverDub)

seq.start()
setTimeout(function() {
    track.addEvent([144,64,64])
    setTimeout(function() {
        track.addEvent([128,64,64])
    }, 200)
}, 5000)

setTimeout(function() {
    seq.setTempo(300)
}, 10000)
    

// console.log(seq.Tracks)

//===================================
function close() { 
    process.exit(0); 
}
process.on('SIGINT', close);
process.on('SIGQUIT', close);