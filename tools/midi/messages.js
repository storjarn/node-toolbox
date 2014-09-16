(function(undefined){

    //Descriptors / Meta
    var ccs = require('./json/ccs');
    var messages = require('./json/messages');

    var Messages = function(){
        var self = this;

        self.Channels = []
        self.Raw = {};

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

        for(var i = 128; i < 160; ++i) {
            self.Raw[i.toString()] = {
                Channel: ((i - 128) % 16) + 1,
                State: (i > 143 ? true : false),
                MsgNum : i
            }
        }

        function translateMsgToCh(msg) {
            return ((msg - 128) % 16) + 1
        }

        self.set = function(vals) {
            var msgType = vals[0]
            if (msgType > 175 && msgType < 192) {               //Continuous Controller
                self.Channels[msgType - 176].Controls[vals[1]] = vals[2]
            } else if (msgType < 144 && msgType > 127) {        //Note Off
                var channel = msgType - 128
                self.Channels[channel].Notes[vals[1]].On = false
                self.Channels[channel].Notes[vals[1]].Velocity = 0
                self.Channels[channel].Notes[vals[1]].Aftertouch = 0
            } else if (msgType > 143 && msgType < 160) {        //Note On
                var channel = msgType - 144
                if (vals[2] == 0) {
                    self.Channels[channel].Notes[vals[1]].On = false
                    self.Channels[channel].Notes[vals[1]].Velocity = 0
                    self.Channels[channel].Notes[vals[1]].Aftertouch = 0
                } else {
                    self.Channels[channel].Notes[vals[1]].On = true
                    self.Channels[channel].Notes[vals[1]].Velocity = vals[2]
                }
            } else if (msgType > 159 && msgType < 176) {        //Note Aftertrouch
                self.Channels[msgType - 160].Notes[vals[1]].Aftertouch = vals[2]
            } else if (msgType > 191 && msgType < 208) {        //Program Change
                self.Channels[msgType - 192].Program = vals[1]
            } else if (msgType > 207 && msgType < 224) {        //Channel Aftertouch
                self.Channels[msgType - 208].Aftertouch = vals[1]
            } else if (msgType > 223 && msgType < 240) {        //Pitchbend
                self.Channels[msgType - 224].PitchBend = {LSB: vals[1], MSB: vals[2]}
            }
        }

    }

    module.exports = Messages;
})();
