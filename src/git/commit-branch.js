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

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(data) {
        switch(state) {
            case -1 :       //Echo
                process.stdout.write(data);
                break;
            case 0 :        //Start
                
                break;
            case 1 :        //Commit message?  Rebase branch?
                state = 2;
                input.CommitMessage = data.replace(/\n/, "").replace(/\"/, "\\\"");

                if (!!input.TicketName && input.CommitMessage != 'n') {
                    var execCmd = "git add -A && git commit -am \""+input.TicketName+" "+input.CommitMessage+"\"";
                    process.stdout.write("exec:  "+ execCmd + "\n");
                    exec(execCmd, function(err, stdout, stderr) {
                        consoleCallback(err, stderr, stdout);
                        process.stdout.write("Want to rebase branch? y or n\n");
                    });
                } else {
                    process.exit(0);
                }
                break;
            case 2 :       //Rebase?  Which Branch?
                state = 3;
                input.Rebase = data.replace(/\n/, "");
                if (input.Rebase == 'y') {
                    process.stdout.write("Type the name of the branch you want to rebase onto.\n");
                    var execCmd = "git branch";
                    process.stdout.write("exec:  "+ execCmd + "\n");
                    exec(execCmd, function(err, stdout, stderr){
                        consoleCallback(err, stderr, stdout);
                    });
                } else {
                    process.exit(0);
                }
                break;
            case 3 :       //Rebase.
                state = 4;
                input.SwitchBranch = data.replace(/\n/, "");
                if (!!input.SwitchBranch) {
                    var execCmd = "git checkout " + input.SwitchBranch;
                    process.stdout.write("exec:  "+ execCmd + "\n");
                    exec(execCmd, function(err, stdout, stderr) {
                        consoleCallback(err, stderr, stdout);
                        execCmd = "git pull";
                        process.stdout.write("exec:  "+ execCmd + "\n");
                        exec(execCmd, function(err, stdout, stderr) {
                            consoleCallback(err, stderr, stdout);
                            execCmd = "git checkout " + input.BranchName;
                            process.stdout.write("exec:  "+ execCmd + "\n");
                            exec(execCmd, function(err, stdout, stderr) {
                                consoleCallback(err, stderr, stdout);
                                execCmd = "git rebase " + input.SwitchBranch;
                                process.stdout.write("exec:  "+ execCmd + "\n");
                                exec(execCmd, function(err, stdout, stderr) {
                                    consoleCallback(err, stderr, stdout);
                                    execCmd = "git checkout " + input.SwitchBranch;
                                    process.stdout.write("exec:  "+ execCmd + "\n");
                                    exec(execCmd, function(err, stdout, stderr) {
                                        consoleCallback(err, stderr, stdout); 
                                        execCmd = "git pull";
                                        process.stdout.write("exec:  "+ execCmd + "\n");
                                        exec(execCmd, function(err, stdout, stderr) {
                                            consoleCallback(err, stderr, stdout);
                                            execCmd = "git checkout " + input.BranchName;
                                            process.stdout.write("exec:  "+ execCmd + "\n");
                                            exec(execCmd, function(err, stdout, stderr) {
                                                consoleCallback(err, stderr, stdout, function(){
                                                    process.exit(0);
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                }
                break;
            case null :     //Quit
                process.exit(0);
        }
    });

    var execCmd = "git rev-parse --abbrev-ref HEAD";
    process.stdout.write("exec:  "+ execCmd + "\n");
    exec(execCmd, function(err, stdout, stderr) {
        consoleCallback(err, stderr, stdout);

        input.BranchName = stdout.toString().replace(/\n/, "");

        input.TicketName = input.BranchName.split("__")[0];
        exec(execCmd, function(err, stdout, stderr) {
            consoleCallback(err, stderr, stdout);
            execCmd = "git status";
            process.stdout.write("exec:  "+ execCmd + "\n");
            exec(execCmd, function(err, stdout, stderr) {
                consoleCallback(err, stderr, stdout);
                process.stdout.write("Commit message? Type the message to continue or 'n' to quit\n");
            });
        });
    });
}

process.on('SIGINT', function () {
    console.log('Got a SIGINT. Goodbye cruel world');
    process.exit(0);
});

    

