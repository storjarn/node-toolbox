#!/usr/local/bin/node

var Console = new (require('./../Console.js')).Console();

Console.Main = function(){
    Console.Exec("git rev-parse --abbrev-ref HEAD", function(err, stdout, stderr) {

        Console.Input.BranchName = Console.cleanInput( stdout.toString() );
        
        Console.Exec("git push origin "+Console.Input.BranchName+"", function(err, stdout, stderr){
            Console.Exit();
        });
    });
};

Console.Run();
    
