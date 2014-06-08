#!/usr/local/bin/node

var Console = new (require('./../Console.js')).Console();

Console.InputHandlers.StdIn = {
    Echo : function(data) {
        Console.Write(data);
    },
    Quit : function(data) {
        Console.Exit(data || 0);
    },
    Start : function(data) {
        Console.Exec("git rev-parse --abbrev-ref HEAD", function(err, stdout, stderr) {
            data = Console.cleanInput( Console.StdOut );
            Console.Input.BranchName = data;
            Console.Input.TicketName = Console.Input.BranchName.split("__")[0];

            Console.Exec("git status", function(err, stdout, stderr) {
                Console.WriteLine("Commit message? Type the message to continue or 'n' to quit");
                Console.HandleInput('StdIn', 'CommitMessage');
            });
        });
    },
    CommitMessage : function(data) {
        Console.Input.CommitMessage = Console.cleanInput(data).replace(/\"/, "\\\"");

        if (!!Console.Input.TicketName && Console.Input.CommitMessage != 'n') {
            Console.Exec(
                "git add -A . && git commit -am \""+Console.Input.TicketName+" "+Console.Input.CommitMessage+"\"", 
                function(err, stdout, stderr) {
                    Console.WriteLine("Want to rebase branch? y or n");
                    Console.HandleInput('StdIn', 'RebaseBranchChoose');
                }
            );
        } else {
            Console.Exit(0);
        }
    },
    RebaseBranchChoose : function(data) {
        Console.Input.Rebase = Console.cleanInput(data);

        if (Console.Input.Rebase == 'y') {
            Console.WriteLine("Type the name of the branch you want to rebase onto.");
            Console.Exec("git branch -a", function(err, stdout, stderr){
                Console.HandleInput('StdIn', 'RebaseBranch');
            });
        } else {
            Console.Exit(0);
        }
    },
    RebaseBranch : function(data) {
        Console.Input.SwitchBranch = Console.cleanInput(data);

        if (!!Console.Input.SwitchBranch) {
            Console.Exec("git checkout " + Console.Input.SwitchBranch, function(err, stdout, stderr) {
                Console.Exec("git pull", function(err, stdout, stderr) {
                    Console.Exec("git checkout " + Console.Input.BranchName, function(err, stdout, stderr) {
                        Console.Exec("git rebase -i " + Console.Input.SwitchBranch, function(err, stdout, stderr) {
                            Console.Exec("git checkout " + Console.Input.SwitchBranch, function(err, stdout, stderr) {
                                Console.Exec("git pull", function(err, stdout, stderr) {
                                    Console.Exec("git checkout " + Console.Input.BranchName, function(err, stdout, stderr) {
                                        Console.Exit(0);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } else {
            Console.Exit(0);
        }
    }
};

Console.Main = function(){
    Console.InputHandlers.StdIn.Start();
};

Console.Run();
    





