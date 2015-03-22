module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['Gruntfile.js', 'src/*.js']
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
        watch: {
            scripts: {
                files: ['src/*'],
                tasks: ['jshint', 'less:dev', 'copy:dev'],
                options: {
                    spawn: false
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('dev', ['jshint', 'less:dev', 'copy:dev']);
    grunt.registerTask('build', ['less:build', 'copy:build']);
    grunt.registerTask('default', ['dev']);
};