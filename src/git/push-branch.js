#!/usr/local/bin/node

var argv = process.argv.slice(2);

var sys = require('sys');
var exec = require('child_process').exec;
    

function help() {
    console.log("usage: ...");
};

if(argv[0] === "--help" || argv[0] === "-h") 
{  
    help();
} else {

    var state = 0;

    var input = {

    };

    function consoleCallback(err, stderr, stdout, callback) {
        if (!!err)  {
            sys.puts(stderr);
            process.exit(1);
        } else {
            sys.puts(stdout);
        }

        if (!!callback) {
            callback();
        }
    }

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    var execCmd = "git rev-parse --abbrev-ref HEAD";
    process.stdout.write("exec:  "+ execCmd + "\n");
    exec(execCmd, function(err, stdout, stderr) {
        consoleCallback(err, stderr, stdout);

        input.BranchName = stdout.toString().replace(/\n/, "");

        execCmd = "git push origin "+input.BranchName+"";
        process.stdout.write("exec:  "+ execCmd + "\n");
        exec(execCmd, function(err, stdout, stderr){
            consoleCallback(err, stderr, stdout, function(){
                process.exit(0);
            });
        });
    });
}

process.on('SIGINT', function () {
    console.log('Got a SIGINT. Goodbye cruel world');
    process.exit(0);
});

    

