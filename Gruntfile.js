module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['Gruntfile.js', 'src/!(*.min).js', 'test/*.js'],
            options: {
                shadow: true
            }
        },
        mocha: {
            test: {
                options: {
                    run: true,
                    urls: ['http://localhost:' + 8080 + '/test/test.html']
                }
            }
        },
        less: {
            dev: {
                files: {
                    "dev/style.css": "src/style.less"
                }
            },
            build: {
                options: {
                    compress: true
                },
                files: {
                    "build/style.css": "src/style.less"
                }
            }
        },
        copy: {
            dev: {
                files: [{
                    expand: true,
                    src: ['src/*.html', 'src/*.js'],
                    dest: 'dev/',
                    filter: 'isFile',
                    flatten: true
                }],
                options: {
                    process: function(content, path) {
                        return grunt.template.process(content, {
                            data: {
                                static: 'http://192.168.59.103:8081/'
                            }
                        });
                    }
                }
            },
            build: {
                files: [{
                    expand: true,
                    src: ['src/*.html', 'src/*.js'],
                    dest: 'build/',
                    filter: 'isFile',
                    flatten: true
                }],
                options: {
                    process: function(content, path) {
                        return grunt.template.process(content, {
                            data: {
                                static: 'http://static.liten.in/'
                            }
                        });
                    }
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8080
                }
            }
        },
        watch: {
            live: {
                files: ['Gruntfile.js', 'src/*', 'test/*'],
                tasks: ['less:dev', 'copy:dev'],
                options: {
                    atBegin: true,
                    spawn: false,
                    livereload: true
                }
            },
            debug: {
                files: ['Gruntfile.js', 'src/*', 'test/*'],
                tasks: ['jshint', 'mocha', 'less:dev', 'copy:dev'],
                options: {
                    atBegin: true,
                    livereload: true
                }
            },
            build: {
                files: ['Gruntfile.js', 'src/*', 'test/*'],
                tasks: ['jshint', 'mocha', 'less:build', 'copy:build'],
                options: {
                    atBegin: true,
                    livereload: true
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('live', ['connect', 'watch:live']);
    grunt.registerTask('debug', ['connect', 'watch:debug']);
    grunt.registerTask('build', ['connect', 'watch:build']);
    grunt.registerTask('default', 'live');
};