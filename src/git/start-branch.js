#!/usr/local/bin/node

var Console = new (require('./../Console.js'))();

Console.InputHandlers.StdIn = {
    Echo : function(data) {
        Console.Write(data);
    },
    Quit : function(data) {
        Console.Exit(data || 0);
    },
    Start : function(data) {
        Console.WriteLine("This application will create a new branch based on a ticket identifier (number) and ticket name, which allows for the other applications in this suite to do things like commit with the ticket number tagged in the commit message.");
        Console.WriteLine("");
        Console.WriteLine("In JIRA, for example, ticket numbers are likely the Epic name (uppercase) and the ticket id, like so: USERS-766.");
        Console.WriteLine("");
        Console.WriteLine("This allows for a git workflow that is based on individual tickets.");
        Console.WriteLine("");

        Console.WriteLine("What is your ticket number? ex. USERS-766");
        Console.HandleInput('StdIn', 'TicketNumber');
    },
    TicketNumber : function(data) {
        Console.Input.TicketNumber = !!data ? Console.cleanInput(data).toUpperCase() : null;
        Console.WriteLine("What is your ticket name? ex. can edit my own information");
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

Console.Run();


