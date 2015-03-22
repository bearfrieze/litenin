module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['Gruntfile.js', 'src/*.js']
        },
        less: {
            dev: {
                files: {
                    "dest/style.css": "src/style.less"
                }
            },
            build: {
                options: {
                    compress: true
                },
                files: {
                    "dest/style.css": "src/style.less"
                }
            }
        },
        copy: {
            dev: {
                files: [{
                    expand: true,
                    src: ['src/*.html', 'src/*.js'],
                    dest: 'dest/',
                    filter: 'isFile',
                    flatten: true
                }]
            }
        },
        watch: {
            scripts: {
                files: ['src/*.less'],
                tasks: ['less:dev', 'copy:dev'],
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
    grunt.registerTask('build', ['less:build']);
    grunt.registerTask('default', ['dev']);
};