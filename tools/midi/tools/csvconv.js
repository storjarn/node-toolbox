//Converter Class
var Converter=require("csvtojson").core.Converter;
var fs=require("fs");

var csvFileName="/Users/cmaples/Downloads/MIDISheet3.csv";
var fileStream=fs.createReadStream(csvFileName);
var outStream = fs.createWriteStream("/Users/cmaples/Dev/midi/messages.json", {})
//new converter instance
var csvConverter=new Converter({constructResult:true});

csvConverter.on("record_parsed",function(resultRow,rawRow,rowIndex){
   // console.log(resultRow); //here is your result json object
});

//end_parsed will be emitted once parsing finished
csvConverter.on("end_parsed",function(jsonObj){
   // console.log(jsonObj); //here is your result json object
});

//read from file
// fileStream.pipe(csvConverter);

var ccs = [];

var readline = require('readline');

var fs = require('fs');

var rl = readline.createInterface({
      input: fileStream,
      output: outStream
    });

  rl.on('line', function (cmd) {
      // console.log('You just typed: '+cmd);
      cmd = cmd.split(',');
      ccs.push({
            MessageNumber: cmd[0].split('=')[2],
            Binary: cmd[0].split('=')[0],
            Hex: cmd[0].split('=')[1],
            Description: cmd[1],
            SecondByte: cmd[2],
            ThirdByte: cmd[3]
        })
    });

  rl.on('close', function() {
      // do something on finish here

    });

fileStream.on('data', function(chunk) {
  console.log('got %d bytes of data', chunk.length);
  // console.log(chunk.toString());
  var data = chunk.toString();



  // rl.close();
})

process.on('exit', function(){
    fs.writeFileSync('/Users/cmaples/Dev/midi/messages.json', JSON.stringify(ccs))
})
