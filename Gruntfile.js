/*global module:false*/
module.exports = function(grunt) {

    var includeMap = require('./tools/toolbox/include.map')
    var externals = []

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
          '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
          '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
          ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['src/**/*.js', 'tools/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            options: {
                curly: false,
                eqeqeq: false,
                immed: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: false,
                boss: true,
                eqnull: false,
                browser: true,
                asi: true,
                laxbreak: false,
                latedef: false,
                loopfunc: true,
                globals: {
                    console: true,
                    require: true,
                    exports: true,
                    module: true
                }
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            src: {
                src: ['src/**/*.js']
            },
            tools: {
                src: ['tools/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src']
            },
            tools: {
                files: '<%= jshint.tools.src %>',
                tasks: ['jshint:tools']
            },
            test: {
                files: ['test/**/*.js', 'test/**/*.html'],
                tasks: ['jshint:test', 'qunit']
            }
        },
        browserify: {
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    // Default task.
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('test', ['jshint', 'qunit'])
    grunt.registerTask('build', ['browserify'/*, 'concat', 'uglify'*/]);

};
