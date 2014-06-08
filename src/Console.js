#!/usr/local/bin/node

(function(context, undefined) {

    var Console = function(){
        var self = this;
        
        ////////////////////////////////
        ////    Config
        ////////////////////////////////
        this.Config = {
            UserInputEnabled : true
        };

        ////////////////////////////////
        ////    Core
        ////////////////////////////////
        this.Arguments = process.argv.slice(2);
        this.Log = [];
        this.Errors = [];
        this.StdOut = null;
        this.StdErr = null;

        var sys = require('sys');
        var exec = require('child_process').exec;

        ////////////////////////////////
        ////    Input/Output
        ////////////////////////////////
        this.Input = {};
        this.InputHandlers = {
            StdIn : {}
        };
        this.InputHandler = function(data) {};
        this.HandleInput = function(parent, name) {
            if (!!self.InputHandlers 
                && !!self.InputHandlers[parent][name]) {
                self.InputHandler = self.InputHandlers[parent][name]
                self.InputHandler.LastInput = (self.Input[parent] ? self.Input[parent][name] || '' : '');
            }
        };

        this.Write = function(data) {
            process.stdout.write(data);
        };

        this.WriteLine = function(data) {
            self.Write(data + '\n');
        };

        ////////////////////////////////
        ////    Events
        ////////////////////////////////
        self.EventHandlers = {
            process : {
                SIGINT : [
                    function (ev) {
                        process.exit(0);
                    }
                ]
            },
            stdin : {
                data : [
                    function(data) {
                        self.InputHandler(data);
                        self.InputHandler.LastInput = data;
                    }
                ]
            },
                
        };

        ////////////////////////////////
        ////    Runtime
        ////////////////////////////////
        self.Initialize = function(){

            if (self.Config.UserInputEnabled) {
                process.stdin.resume();
                process.stdin.setEncoding('utf8');

                for (var eventName in self.EventHandlers.stdin) {
                    var eventName1 = eventName;
                    for (var i = 0; i < self.EventHandlers.stdin[eventName1].length; ++i) {
                        var stdinEvent = self.EventHandlers.stdin[eventName1][i];
                        process.stdin.on(eventName1, function (data) {
                            var eventName2 = eventName1;
                            console.log('Event ' +eventName2+ ' received.');
                            stdinEvent(data);
                        });
                    }
                }
            }
            
            for (var eventName in self.EventHandlers.process) {
                for (var i = 0; i < self.EventHandlers.process[eventName].length; ++i) {
                    var eventName1 = eventName;
                    process.on(eventName1, function (ev) {
                        var eventName2 = eventName1;
                        console.log('Event ' +eventName2+ ' received.');
                        !!self.EventHandlers.process[eventName2][i] 
                            && typeof self.EventHandlers.process[eventName2][i] == 'function'
                            && self.EventHandlers.process[eventName2][i](ev);
                    });
                }
            }
                
        };

        this.Run = function(){
            self.Initialize();
            if(self.Arguments.length && (self.Arguments[0] === "--help" || self.Arguments[0] === "-h")) 
            {  
                self.ShowHelp();
            } else {
                self.Main();
            }
        };
        this.Main = function(){};

        ////////////////////////////////
        ////    UI
        ////////////////////////////////
        this.ShowHelp = function(){
            console.log(this.HelpText);
        };
        this.HelpText = "usage: ...";

        ////////////////////////////////
        ////    Utility
        ////////////////////////////////
        this.consoleCallback = function(err, stderr, stdout, callback) {

            if (!!err)  {
                sys.puts(stderr);
                process.exit(1);
            } else {
                sys.puts(stdout);
            }

            if (!!callback) {
                callback();
            }
        };

        this.Exec = function(execCmd, callback){
            process.stdout.write("exec:  "+ execCmd + "\n");
            exec(execCmd, function(err, stdout, stderr) {
                self.StdOut = stdout ? stdout.toString() : '';
                self.StdErr = stderr ? stderr.toString() : '';
                self.consoleCallback(err, stderr, stdout, function(){
                    !!callback && callback(err, stderr, stdout);
                });
            });
        };

        this.cleanInput = function(data) {
            return data.replace(/\n/, "");
        };

        this.Exit = function(code) {
            process.exit(code || 0);
        };
    };

    exports.Console = Console;

})(this);

    

    

