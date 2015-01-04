var bower = require('./bower.json');
var gulp = require('gulp');
var sass = require('gulp-sass');
var connect = require('gulp-connect');
var open = require('open');
var deploy = require('gulp-gh-pages');
var filter = require('gulp-filter');
var useref = require('gulp-useref');
var csso = require('gulp-csso');
var angularTemplatecache = require('gulp-angular-templatecache');

/**
 *
 * Private Tasks
 *
 */

gulp.task('styles', function () {
    gulp.src('./app/src/main.scss').pipe(sass()).pipe(gulp.dest('./app'));
});

gulp.task('watch', function() {
    gulp.watch('app/src/**/*.scss').on('change', function(file) {
        gulp.run('styles');
    });
});

gulp.task('i18n', function () {
    return gulp.src([
        'app/i18n/**/*json',
    ]).pipe(gulp.dest('dist/i18n'));
});

gulp.task('fonts', function () {
    return gulp.src([
        'app/bower_components/font-awesome/fonts/*.*'
    ]).pipe(gulp.dest('dist/fonts'));
});

gulp.task('template', function () {
    return gulp.src(['app/app_components/**/*.html', 'app/src/**/*.html']).pipe(angularTemplatecache({
        module: 'app', root: 'src/'
    })).pipe(gulp.dest('dist/scripts'));
});

gulp.task('html', ['styles'], function () {
    var assets = useref.assets();
    var jsFilter = filter('app/**/*.js');
    var cssFilter = filter('app/**/*.css');

    return gulp.src('app/index.html')
        .pipe(assets)
        .pipe(jsFilter)
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe(csso())
        .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

/**
 *
 * Public Tasks
 *
 */

gulp.task('serve', ['styles', 'watch'], function () {
    connect.server({
        root: ['app'],
        port: 9000,
        livereload: true
    });
    open('http://localhost:9000/#/');
});

gulp.task('dist', ['i18n','fonts' , 'html', 'template']);

gulp.task('deploy', ['dist'], function () {
    return gulp.src('dist/**/*').pipe(deploy({
        remoteUrl: bower.repository.url
    }));
});
