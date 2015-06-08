'use strict';

module.exports = function(grunt) {

    //
    //  Load all tasks
    //

    require('load-grunt-tasks')(grunt);



    //
    //  Show elapsed time
    //

    require('time-grunt')(grunt);



    var path       = require("path");

    var semver     = require('semver');

    var pkg        = grunt.file.readJSON('package.json');



    //
    //  Javascript file list
    //

    var jsFileList = [

        //
        //  App related files
        //

        '*.js',



        //
        //  Ignore some files
        //

        '!Gruntfile.js'

    ];



    //
    //  Grunt configuration
    //

    grunt.initConfig({

        //
        // Let's read the project configuration
        //

        pkg: pkg,

        copy: {
            default: {
            },

            build: {
                files: [
                    {
                        expand:  true,
                        flatten: false,
                        dest:    'build',
                        src:     [ 'img/**' ]
                    }
                ]
            },

            deploy: {
                files: [
                    {
                        expand:  true,
                        flatten: false,
                        dest:    'deploy',
                        cwd:     'build/',
                        src:     [ '**' ]
                    }
                ]
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= pkg.name %>.js'
            ]
        },

        less: {
            build: {
                files: {
                    'build/themes/dark-bottom.css': [
                        'styles/dark-bottom.less'
                    ],
                    'build/themes/dark-floating-tada.css': [
                        'styles/dark-floating-tada.less'
                    ],
                    'build/themes/dark-floating.css': [
                        'styles/dark-floating.less'
                    ],
                    'build/themes/dark-inline.css': [
                        'styles/dark-inline.less'
                    ],
                    'build/themes/dark-top.css': [
                        'styles/dark-top.less'
                    ],
                    'build/themes/light-bottom.css': [
                        'styles/light-bottom.less'
                    ],
                    'build/themes/light-floating.css': [
                        'styles/light-floating.less'
                    ],
                    'build/themes/light-top.css': [
                        'styles/light-top.less'
                    ]

                },
                options: {
                    compress:  true,
                    sourceMap: false
                }
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src:  [jsFileList],
                dest: 'build/<%= pkg.name %>.js'
            }
        },

        uglify: {
            options: {
                compress: {
                    sequences     : true,  // join consecutive statemets with the “comma operator”
                    properties    : true,  // optimize property access: a["foo"] → a.foo
                    dead_code     : true,  // discard unreachable code
                    drop_debugger : true,  // discard “debugger” statements
                    unsafe        : false, // some unsafe optimizations (see below)
                    conditionals  : true,  // optimize if-s and conditional expressions
                    comparisons   : true,  // optimize comparisons
                    evaluate      : true,  // evaluate constant expressions
                    booleans      : true,  // optimize boolean expressions
                    loops         : true,  // optimize loops
                    unused        : true,  // drop unused variables/functions
                    hoist_funs    : true,  // hoist function declarations
                    hoist_vars    : false, // hoist variable declarations
                    if_return     : true,  // optimize if-s followed by return/continue
                    join_vars     : true,  // join var declarations
                    cascade       : true,  // try to cascade `right` into `left` in sequences
                    side_effects  : true,  // drop side-effect-free statements
                    warnings      : true,  // warn about potentially dangerous optimizations/code
                    global_defs   : {}     // global definitions
                }
            },
            dist: {
                files: [
                    {
                        'build/<%= pkg.name %>.min.js': ['build/<%= pkg.name %>.js']
                    }
                ]
            }
        },

        clean: {

            //
            //  Remove old files before building Css & Js
            //

            prebuild: {
                dot: true,
                src:[
                    'build/themes/*.css',
                    'build/*.js',
                    '!build/.gitignore'
                ]
            },

            //
            //  Remove files left by DEV environment or useless
            //

            build: [
                'build/<%= pkg.name %>.js'
            ],

            //
            //  Remove files after deploying
            //

            deploy: {
                dot: true,
                src:[
                    'deploy/**',
                    '!deploy/.gitignore'
                ]
            }

        },

        bump: {
            options: {
                files:              ['package.json', 'bower.json'],
                updateConfigs:      ['pkg'],
                commit:             true,
                commitMessage:      '[UPDATE] Version Bump to v%VERSION%',
                commitFiles:        ['package.json', 'bower.json'],
                createTag:          false,
                tagName:            '%VERSION%',
                tagMessage:         'Release v%VERSION%',
                push:               false,
                pushTo:             'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace:      false,
                prereleaseName:     'rc',
                regExp:             false
            }
        },

        prompt: {
            bump: {
                options: {
                    questions: [
                        {
                            config:  'bump.increment',
                            type:    'list',
                            message: 'Bump version from <%= pkg.version %> to:',
                            choices: [
                                {
                                    value: 'build',
                                    name:  'Build:  '+ (pkg.version + '-?') + ' Unstable, betas, and release candidates.'
                                },
                                {
                                    value: 'patch',
                                    name:  'Patch:  ' + semver.inc(pkg.version, 'patch') + ' Small improvements or bug fixes.'
                                },
                                {
                                    value: 'minor',
                                    name:  'Minor:  ' + semver.inc(pkg.version, 'minor') + ' Add functionality in a backwards-compatible manner.'
                                },
                                {
                                    value: 'major',
                                    name:  'Major:  ' + semver.inc(pkg.version, 'major') + ' Major upgrade or incompatible API changes.'
                                },
                                {
                                    value: 'custom',
                                    name:  'Custom: ?.?.? Specify version...'
                                }
                            ]
                        },
                        {
                            config:   'bump.version',
                            type:     'input',
                            message:  'What specific version would you like',
                            when:     function (answers) {
                                return answers['bump.increment'] === 'custom';
                            },
                            validate: function (value) {
                                var valid = semver.valid(value);
                                if( valid )
                                {
                                    grunt.option( 'setversion', valid );
                                    return true;
                                }
                                return 'Must be a valid semver, such as 1.2.3-rc1. See http://semver.org/ for more details.';
                            }
                        }
                    ]
                }
            }
        },

        buildcontrol: {
            options: {
                dir:     'deploy',
                commit:  true,
                push:    true,
                message: '[DEPLOY] Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
            },
            local: {
                options: {
                    remote: '../',
                    branch: 'deploy',
                    tag:    '<%= pkg.version %>'
                }
            }
        }
    });



    //
    //  Register tasks
    //

    //
    //  default
    //

    grunt.registerTask('default', [
        'build'
    ]);



    //
    //  build
    //

    grunt.registerTask('build', [
        'clean:prebuild',
        'copy:build',
        'jshint',
        'less:build',
        'concat',
        'uglify',
        'clean:build'
    ]);



    //
    //  deploy
    //

    grunt.registerTask('deploy', [
        'prompt:bump',
        'bump',
        'build',
        'copy:deploy',
        'buildcontrol:local',
        'clean:deploy'
    ]);

};


