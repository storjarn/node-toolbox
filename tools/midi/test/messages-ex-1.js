var Messages = require('../messages');
var msgs = new Messages();
var midi = require('midi');
var util = require('util');
var output = new midi.output();

var now = process.hrtime();

function sendMessage(arr) {
    msgs.set(arr);
    output.sendMessage(arr);
}

function timePrint(diff) {
    return (diff[0] * 1e9 + diff[1]) / 1000000
}

function timeLog(label) {
    console.log(label, timePrint(process.hrtime(now)) + ' ms')
    now = process.hrtime();
}

for(var i = 0; i < output.getPortCount(); ++i) {
    console.log('Output', i, output.getPortName(i));
}

if (output.getPortCount()) {
    output.openPort(0);

    // for(var i = 0; i < 1000; ++i) {
    //     sendMessage([252]);
    // }

    timeLog('Init:')

    sendMessage([144, 64, 64]);
    sendMessage([248]);
    sendMessage([128, 64, 64]);

    sendMessage([144,64,64]);
    sendMessage([128, 64, 64]);
    sendMessage([255]);

    timeLog('Test1:')
    console.log(util.inspect(msgs.Channels[0].Notes[64], {showHidden:true, depth:4}));
    timeLog('Inspect1:')

    var msgTiming = process.hrtime();
    var timingMsgCount = 0;

    for(var i = 0; i < 200; ++i) {
        timingMsgCount += 3
        sendMessage([248]);
        sendMessage([128, 64, 64]);
        sendMessage([144,64,64]);
        var msgTiming2 = process.hrtime(msgTiming);
        if (Math.floor(timePrint(msgTiming2)) > 0) {
            console.log(timingMsgCount, 'messages in a ms')
            msgTiming = process.hrtime();
            timingMsgCount = 0
        }
    }
    timeLog('Test2:')

    output.closePort();

}


var Notes = [];

for(var i = 128; i < 160; ++i) {
    Notes.push({
        Channel: ((i - 128) % 16) + 1,
        State: (i > 143 ? true : false),
        MsgNum : i
    })
}

console.log(Notes)
