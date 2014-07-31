#!/usr/bin/env node

var program = require('commander'),
    path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec;

var extension = '';

program
  .version(JSON.parse(fs.readFileSync(__dirname + '/../../package.json', 'utf8')).version)
  .usage('')
  .option('-ne, --no-extension', 'create the program without the "js" extension')
  .option('-pn, --programname <programname>', 'name of the program file to create')
  .option('-pl, --programlocation <programlocation>', 'folder path to create the file')

program.name = 'node-toolbox.tools.node.newprogram';

var newProgramTemplate = "#!/usr/bin/env node \n\n(function(context, undefined){\n\n})(this);";

program.parse(process.argv);

// console.log(program);

function hasNameAndLocation(name, location){
    if (program.extension == true) {
        extension = '.js';
    }
    var filepath = path.resolve(path.join(location, name) + extension);

    // console.log(program);

    fs.writeFile(filepath, newProgramTemplate, function (err) {
        if (err) throw err;
        exec("chmod 755 " + filepath, function(error, stdout, stderr){
            if (error) throw error;
            exec("ls -la " + filepath, function(error, stdout, stderr){
                if (error) throw error;
                console.log(filepath+' saved!');
                process.exit(0);
            });
        });
    });
}

function promptName (callback) {
    program.prompt('\nYour program name: ', function(name){
        program.programname = name;
        if (!!program.programname && !!program.programlocation) {
            hasNameAndLocation(
                program.programname, program.programlocation
            )
        } else if (!!callback) {
            callback();
        } else {
            program.help();
        }
    });
}

function promptLoc(callback) {
    program.prompt('\nYour program location: ', function(location){
        program.programlocation = location;
        if (!!program.programname && !!program.programlocation) {
            hasNameAndLocation(
                program.programname, program.programlocation
            )
        } else if (!!callback) {
            callback();
        } else {
            program.help();
        }
    });
}

if (!!program.programname && !!program.programlocation) {
    hasNameAndLocation(
        program.programname, program.programlocation
    )
} else if(!!program.programname) {
    promptName();
} else if(!!program.programlocation) {
    promptLoc();
} else {
    promptName(promptLoc);
}



