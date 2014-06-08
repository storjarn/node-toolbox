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
        Console.WriteLine("What is your ticket number?");
        Console.HandleInput('StdIn', 'TicketNumber');
    },
    TicketNumber : function(data) {
        Console.Input.TicketNumber = !!data ? Console.cleanInput(data).toUpperCase() : null;
        Console.WriteLine("What is your ticket name?");
        Console.HandleInput('StdIn', 'TicketName');
    },
    TicketName : function(data) {
        Console.Input.TicketName = !!data ? Console.cleanInput(data).toLowerCase().split(" ").join("-") : null;

        if (!!Console.Input.TicketName && !!Console.Input.TicketNumber) {

            var branchName = Console.Input.TicketNumber+"__"+Console.Input.TicketName;

            Console.Exec("git checkout -b "+branchName, function(err, stdout, stderr) {
                Console.Exec(
                    "git push --set-upstream origin " + branchName, 
                    function(err, stdout, stderr){
                        Console.Exit();
                    }
                )
            });

        } else {
            Console.WriteLine("Error:  You need to provide a ticket number and name!");
            Console.Exit(1);
        }
    }
};

Console.Main = function(){
    Console.InputHandlers.StdIn.Start();
};

Console.Run();
    

