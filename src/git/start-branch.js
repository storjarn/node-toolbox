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

    state = 1;
    process.stdout.write("What is your ticket number?\n");

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(data) {
        switch(state) {
            case -1 :       //Echo
                process.stdout.write(data);
                break;
            case 0 :        //Start
                
                break;
            case 1 :        //Ticket Number?
                input.TicketNumber = !!data ? data.toUpperCase().replace("\n", "") : null;
                state = 2;
                process.stdout.write("What is your ticket name?\n");
                break;
            case 2 :
                input.TicketName = !!data ? data.toLowerCase().replace("\n", "").split(" ").join("-") : null;

                if (!!input.TicketName && !!input.TicketNumber) {

                    state = null;

                    var branchName = input.TicketNumber+"__"+input.TicketName;

                    var execCmd = "git checkout -b "+branchName;
                    process.stdout.write("exec:  "+ execCmd + "\n");
                    exec("git checkout -b "+branchName, function(err, stdout, stderr) {
                        consoleCallback(err, stderr, stdout);

                        execCmd = "git push --set-upstream origin HEAD:" + branchName;
                        process.stdout.write("exec:  "+ execCmd + "\n");
                        exec("git push --set-upstream origin " + branchName, function(err, stdout, stderr) {
                            consoleCallback(err, stderr, stdout, function(){
                                process.exit(0);
                            });
                        });

                    });

                } else {
                    process.stdout.write("Error:  You need to provide a ticket number and name!");
                    process.exit(1);
                }
                break;
            case null :     //Quit
                process.exit(0);
        }
    });
}

process.on('SIGINT', function () {
    console.log('Got a SIGINT. Goodbye cruel world');
    process.exit(0);
});

    

