var gulp = require('gulp');
var sass = require('gulp-sass');
var connect = require('gulp-connect');
var open = require('open');

gulp.task('styles', function () {
    gulp.src('./app/src/main.scss')
        .pipe(sass())
        .pipe(gulp.dest('./app'));
});

gulp.task('watch', function() {
    gulp.watch('app/src/**/*.scss').on('change', function(file) {
        gulp.run('styles');
    });
});

gulp.task('serve', ['styles', 'watch'], function () {
    connect.server({
        root: ['app'],
        port: 9000,
        livereload: true
    });
    open('http://localhost:9000/#/');
});
