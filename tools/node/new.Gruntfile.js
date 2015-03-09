/* jshint laxbreak: true */
module.exports = function(grunt) {

    grunt.timers = {};
    grunt.cleanup = [];

    //TODO:: create a timestamp logging function
    grunt.log.timestampFormat = "MMM DD YYYY HH:mm:ss:SSS ZZ";
    grunt.log.timestamp = function(msg) {
        var now = moment().format(grunt.log.timestampFormat);
        grunt.log.writeln(now + " : " + msg);
    };

    var DBFile = function(options) {
        var self = this;
        self.grunt = grunt;
        _.extend(self, options);

        this.Data = grunt.file.readJSON(options.Location);
        this.save = function() {
            this.grunt.file.write(
                this.Location,
                JSON.stringify(this.Data, null, 4)
            );
        };
    };

    /*
        Requires
     */
    var _ = grunt._ = require('underscore');
    var moment = grunt.moment = require('moment');
    var async = grunt._async = require('async');
    grunt._DBFile = DBFile;

    /*
        Task Config
     */
    grunt.initConfig({
        'pkg': grunt.file.readJSON('./package.json')
    });

    grunt.task.loadTasks('./tasks');

    /*
        Process utilities
     */
    function exit(done) {
        _.each(grunt.timers, function(tmr, index, timers) {
            try { clearInterval(tmr); } catch(ex) {}
            try { clearTimeout(tmr); } catch(ex) {}
        });
        _.each(grunt.cleanup, function(fn, index, list) {
            try { fn(grunt); } catch(ex) {}
        });
        if (done) { done(); }
    }

    process.on('exit', exit);
    process.on('SIGINT', exit);
    process.on('SIGTSTP', exit);
    process.on('uncaughtException', function(err){
        console.error(err);
        exit();
    });
};
