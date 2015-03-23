module.exports = function(grunt) {
    var port = 8080;
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['Gruntfile.js', 'src/*.js', 'test/*.js']
        },
        mocha: {
            test: {
                options: {
                    run: true,
                    urls: ['http://localhost:' + port + '/test/test.html']
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
                }]
            },
            build: {
                files: [{
                    expand: true,
                    src: ['src/*.html', 'src/*.js'],
                    dest: 'build/',
                    filter: 'isFile',
                    flatten: true
                }]
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
            debug: {
                files: ['Gruntfile.js', 'src/*', 'test/*'],
                tasks: ['jshint', 'mocha', 'less:dev', 'copy:dev'],
                options: {
                    spawn: false,
                    livereload: true
                }
            },
            live: {
                files: ['Gruntfile.js', 'src/*', 'test/*'],
                tasks: ['less:dev', 'copy:dev'],
                options: {
                    spawn: false,
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
    grunt.registerTask('dev', ['connect', 'jshint', 'mocha', 'less:dev', 'copy:dev']);
    grunt.registerTask('build', ['less:build', 'copy:build']);
    grunt.registerTask('debug', ['dev', 'watch:debug']);
    grunt.registerTask('default', ['connect', 'watch:live']);
};