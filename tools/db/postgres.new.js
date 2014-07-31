#!/usr/bin/env node

var program = require('commander'),
    path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec;

var Promise = require("bluebird");
exec = Promise.promisify(exec);
program.prompt = Promise.promisify(program.prompt);

program
  .version(JSON.parse(fs.readFileSync(__dirname + '/../../package.json', 'utf8')).version)
  .usage('')
  .option('-u, --dbuser <dbuser>', 'name of the database user to own the database')
  .option('-db, --dbname <dbname>', 'name of the database to create')
  .option('-p, --dbpass <dbpass>', 'password of the database user')

program.name = 'node-toolbox.tools.db.postgres.new';

var newShellTemplate = "#!/bin/sh\n\necho \"Recreating the database 'DBNAME' in postgres.\"\npsql -h localhost -U postgres -a -f EXECPATH/pg.db.DBNAME.create.sql";

var newSqlTemplate = "\n" +
"REVOKE CONNECT ON DATABASE DBNAME FROM public;\n" +
"ALTER DATABASE DBNAME CONNECTION LIMIT 0;\n" +
"\n" +
"-- 9.1\n" +
"SELECT pg_terminate_backend(procpid)\n" +
"FROM pg_stat_get_activity(NULL::integer)\n" +
"WHERE datid=(SELECT oid from pg_database where datname = 'DBNAME');\n" +
"\n" +
"-- SELECT pg_terminate_backend(pg_stat_activity.procpid)\n" +
"-- FROM pg_stat_activity\n" +
"-- WHERE pg_stat_activity.datname = 'DBNAME'\n" +
"--   AND procpid <> pg_backend_pid();\n" +
"\n" +
"-- 9.2+\n"+
"SELECT pg_terminate_backend(pid)\n" +
"FROM pg_stat_get_activity(NULL::integer)\n" +
"WHERE datid=(SELECT oid from pg_database where datname = 'DBNAME');\n" +
"\n" +
"-- SELECT pg_terminate_backend(pid)\n" +
"--  FROM pg_stat_activity\n" +
"--  WHERE pid <> pg_backend_pid()\n" +
"--  AND datname='DBNAME';\n" +
"\n" +
"DROP DATABASE IF EXISTS DBNAME;\n" +
"DROP ROLE IF EXISTS USERNAME;\n" +
"\n" +
"CREATE ROLE USERNAME ENCRYPTED PASSWORD 'PASSWD' LOGIN INHERIT SUPERUSER;\n" +
"CREATE DATABASE DBNAME OWNER USERNAME;\n" +
"GRANT ALL PRIVILEGES ON DATABASE DBNAME TO USERNAME;\n";

program.parse(process.argv);

// console.log(program);

function createPassword() {
    return require('crypto').createHash('md5');
}

function setVars(txt, vars) {
    return txt.toString()
        .replace(/DBNAME/ig, vars.dbname)
        .replace(/USERNAME/ig, vars.dbuser)
        .replace(/PASSWD/ig, vars.dbpass);
}

function hasVars(execPath){

    promptDbPassword()
    .then(function(){

        var rootPath = path.resolve(path.join(execPath, program.dbname));
        var shellpath = rootPath + ".sh";
        var sqlpath = rootPath + ".sql";

        var vars = {
            dbname : program.dbname,
            dbuser : program.dbuser,
            dbpass : program.dbpass
        }

        var shellTxt = setVars(newShellTemplate, vars);

        var sqlTxt = setVars(newSqlTemplate, vars);

        fs.writeFileSync(shellpath, shellTxt);

        exec("chmod 755 " + shellpath)
        .then(function(error, stdout, stderr){
            if (error) throw error;
            fs.writeFileSync(sqlpath, sqlTxt);
            exec("ls -la " + rootPath, function(error, stdout, stderr){
                if (error) throw error;
                console.log('Files saved!');
                process.exit(0);
            });
        }, function(error) {
            if (error) throw error;
        })
    }, function(err) {
        if (error) throw error;
    })
}

function promptDbName (callback) {
    program.prompt('\nYour database name: ', function(name){
        program.dbname = name;
        if (!!program.dbname && !!program.dbuser) {
            hasVars( "./" )
        } else {
            program.help();
        }
    });
}

var promptDbPassword = Promise.promisify(function() {
    if (!program.dbpass) {
        program.prompt('\nWould you like a password generated for you? (y or n): ', function(generate){
            if (generate == 'n') {
                program.prompt('\nYour database password: ', function(name){
                    program.dbpass = name;
                    if (!!program.dbname && !!program.dbuser) {
                        hasVars( "./" )
                    } else {
                        program.help();
                    }
                });
            } else {
                program.dbpass = createPassword();
            }
        });
    }
});


function promptDbUsername() {
    program.prompt('\nYour database username: ', function(name){
        program.dbuser = name;
        if (!!program.dbname && !!program.dbuser) {
            hasVars( "./" )
        } else {
            program.help();
        }
    });
}

if (!!program.dbname && !!program.dbuser) {
    hasVars( "./" )
} else if(!!program.dbuser) {
    promptDbName();
} else if(!!program.dbname) {
    promptDbUsername();
} else {
    promptDbName();
}

