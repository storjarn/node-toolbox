(function(undefined){

    var now = new Date().getTime();

    var util = require('util');

    //Descriptors / Meta
    var ccs = require('./json/ccs');
    var messages = require('./json/messages');

    var Messages = function(){
        var self = this;

        self.Channels = [],
        self.Raw = { };
        self.Labels = { };

        var valMin = 0,
            valMax = 127
            defaultCCVal = 64;

        for(var j = 0; j < 16; ++j) {
            var channel = j.toString();
            self.Channels.push({
                Channel: j,
                Program: 0,
                Aftertouch: 0,
                PitchBend : {
                    LSB: 0,
                    MSB: 0
                },
                Notes : [],
                Controls : []
            })

            for(var i = 0; i < 128; ++i) {
                var note = cc = i.toString();
                self.Channels[j].Notes.push({
                    On: false,
                    Velocity: 0,
                    Aftertouch: 0
                })
                self.Channels[j].Controls.push(defaultCCVal)
            }
        }

        function limitVal(val) {
            // return val;
            return Math.max(Math.min(valMax, val), valMin);
        }

        function getNote(channel, noteNum) {
            // console.log(channel, noteNum)
            return self.Channels[(channel - 1)].Notes[noteNum];
        }
        function setNote(channel, noteNum, note) {
            self.Channels[(channel - 1)].Notes[noteNum] = note;
        }

        function getControl(channel, ccNum) {
            return self.Channels[(channel - 1)].Controls[ccNum];
        }
        function setControl(channel, ccNum, cc) {
            self.Channels[(channel - 1)].Controls[ccNum] = cc;
        }

        self.msg = function msg() {
            var args = Array.prototype.slice.call(arguments)[0]
            return self.Raw[args[0].toString()].apply(null, args.slice(1));
        }


        for(var i = 1; i < 17; ++i) {
            //Note off
            self.Labels[(i + 127).toString()] = 'Ch. ' +i+ ' Note Off';
            self.Raw[(i + 127).toString()] = (function(i){
                return function(noteNum, noteVel) {
                    noteNum = limitVal(noteNum);
                    noteVel = limitVal(noteVel);
                    var note = getNote(i, noteNum);
                    note.On = false;
                    note.Velocity = noteVel;
                    note.Aftertouch = 0;
                    setNote(i, noteNum, note);
                }
            })(i)
            //Note on
            self.Labels[(i + 143).toString()] = 'Ch. ' +i+ ' Note On';
            self.Raw[(i + 143).toString()] = (function(i){
                return function(noteNum, noteVel) {
                    noteNum = limitVal(noteNum);
                    noteVel = limitVal(noteVel);
                    var note = getNote(i, noteNum);
                    note.On = true;
                    note.Velocity = noteVel;
                    setNote(i, noteNum, note);
                }
            })(i)
            //Polyphonic Aftertouch
            self.Labels[(i + 159).toString()] = 'Ch. ' +i+ ' Note Aftertouch';
            self.Raw[(i + 159).toString()] = (function(i) {
                return function(noteNum, noteVel) {
                    noteNum = limitVal(noteNum);
                    noteVel = limitVal(noteVel);
                    var note = getNote(i, noteNum);
                    note.Aftertouch = noteVel;
                    setNote(i, noteNum, note);
                }
            })(i)
            //Control Change
            self.Labels[(i + 175).toString()] = 'Ch. ' +i+ ' Continuous Controller';
            self.Raw[(i + 175).toString()] = (function(i){
                return function(ccNum, ccVal) {
                    ccNum = limitVal(ccNum);
                    ccVal = limitVal(ccVal);
                    if (ccVal == undefined) {
                        return getControl(i, ccNum)
                    } else {
                        setControl(i, ccNum, ccVal)
                    }
                }
            })(i)
            //Program Change
            self.Labels[(i + 191).toString()] = 'Ch. ' +i+ ' Program Change';
            self.Raw[(i + 191).toString()] = (function(i) {
                return function(progVal) {
                    progVal = limitVal(progVal);
                    self.Channels[(channel - 1).toString()].Program = progVal;
                }
            })(i)
            //Channel Aftertouch
            self.Labels[(i + 207).toString()] = 'Ch. ' +i+ ' Aftertouch';
            self.Raw[(i + 207).toString()] = (function(i) {
                return function(atVal) {
                    atVal = limitVal(atVal);
                    self.Channels[(channel - 1).toString()].Aftertouch = atVal;
                }
            })(i)
            //Pitchbend
            self.Labels[(i + 223).toString()] = 'Ch. ' +i+ ' Pitchbend';
            self.Raw[(i + 223).toString()] = (function(i) {
                return function(pVal1, pVal2) {
                    pVal1 = limitVal(pVal1);
                    pVal2 = limitVal(pVal2);
                    self.Channels[(channel - 1).toString()].Pitchbend = {LSB:pVal1, MSB:pVal2}
                }
            })(i)
        }

        //SysEx
        self.Labels['240'] = 'System Exclusive';
        self.Raw[(240).toString()] = function(vendorID, data) {
        }
        //MIDI Time Code Qtr. Frame
        self.Labels['241'] = 'MIDI Time Code Qtr. Frame';
        self.Raw[(241).toString()] = function(msgType, val) {
        }
        //Song Position Pointer
        self.Labels['242'] = 'Song Position Pointer';
        self.Raw[(242).toString()] = function(lsb, msb) {
        }
        //Song Select (Song #)
        self.Labels['243'] = 'Song Select (Song #)';
        self.Raw[(243).toString()] = function(songNum) {
        }
        //Undefined (Reserved)
        self.Labels['244'] = 'Undefined (Reserved)';
        self.Raw[(244).toString()] = function(data1, data2) {
        }
        //Undefined (Reserved)
        self.Labels['245'] = 'Undefined (Reserved)';
        self.Raw[(245).toString()] = function(data1, data2) {
        }
        //Tune Request
        self.Labels['246'] = 'Tune request';
        self.Raw[(246).toString()] = function() {
        }
        //End of SysEx (EOX)
        self.Labels['247'] = 'End of SysEx (EOX)';
        self.Raw[(247).toString()] = function() {
        }
        //Timing Clock
        self.Labels['248'] = 'Timing clock';
        self.Raw[(248).toString()] = function() {
        }
        //Undefined (Reserved)
        self.Labels['249'] = 'Undefined (Reserved)';
        self.Raw[(249).toString()] = function() {
        }
        //Start
        self.Labels['250'] = 'Start';
        self.Raw[(250).toString()] = function() {
        }
        //Continue
        self.Labels['251'] = 'Continue';
        self.Raw[(251).toString()] = function() {
        }
        //Stop
        self.Labels['252'] = 'Stop';
        self.Raw[(252).toString()] = function() {
        }
        //Undefined (Reserved)
        self.Labels['253'] = 'Undefined (Reserved)';
        self.Raw[(253).toString()] = function() {
        }
        //Active Sensing
        self.Labels['254'] = 'Active Sensing';
        self.Raw[(254).toString()] = function() {
        }
        //System Reset
        self.Labels['255'] = 'System Reset';
        self.Raw[(255).toString()] = function() {
            console.log("System Reset")
        }

    }

    console.log('Init:', new Date().getTime() - now + ' ms')
    now = new Date().getTime()

    var msgs = new Messages();
    msgs.msg([144, 64, 64]);
    // console.log(util.inspect(msgs.Channels[0].Notes[64], {showHidden:true, depth:4}));
    msgs.msg([255]);

    console.log('Test:', new Date().getTime() - now + ' ms')

    module.exports = Messages;
})();
