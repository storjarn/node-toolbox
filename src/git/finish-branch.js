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

            Console.WriteLine("Delete the current branch? y or n");
            Console.HandleInput('StdIn', 'SelectBranch');
        });
    },
    SelectBranch : function(data) {
        Console.Input.DeleteBranch = Console.cleanInput(data);

        if (Console.Input.DeleteBranch == 'y') {
            Console.WriteLine("Type the name of the branch you want to change to.");
            Console.Exec("git branch -r", function(err, stdout, stderr){
                Console.HandleInput('StdIn', 'DeleteBranch');
            });
        } else {
            Console.Exit(0);
        }
    },
    DeleteBranch : function(data) {
        Console.Input.SwitchBranch = Console.cleanInput(data);
        if (!!Console.Input.SwitchBranch) {
            Console.Exec("git checkout " + Console.Input.SwitchBranch, function(err, stdout, stderr) {
                Console.Exec("git push origin :" + Console.Input.BranchName, function(err, stdout, stderr) {
                    Console.Exec("git branch -d " + Console.Input.BranchName, function(err, stdout, stderr) {
                        Console.Exit(0);
                    });
                });
            });
        }
    }
};

Console.Main = function(){
    Console.InputHandlers.StdIn.Start();
};

Console.Run();
    



