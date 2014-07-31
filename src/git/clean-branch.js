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
        Console.Exec("git clean -n", function(err, stdout, stderr) {
            Console.WriteLine("Want to continue cleaning? y or n");
            Console.HandleInput('StdIn', 'Clean');
        });
    },
    Clean : function(data) {
        Console.Input.Clean = Console.cleanInput(data);

        if (Console.Input.Clean != 'n') {

            Console.Exec("git clean -f", function(err, stdout, stderr) {
                Console.Exit();
            });

        } else {
            Console.Exit();
        }
    }
};

Console.Main = function(){
    Console.InputHandlers.StdIn.Start();
};

Console.Run();

