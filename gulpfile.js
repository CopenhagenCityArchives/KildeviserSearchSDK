/**
 *
 * God basis gulp fil.
 * Kan:
 * 1) con: Concate flere .js filer til én fil
 * 2) minify: Overvåge filer .js-filer og køre minify
 * 3) connomini: Concat flere .js filer uden minify (til debugging)
 * 4) toprod: Kopiere filer til en produktionsmappe
 *
 */

//Options
var opt = {};


opt.dest = "dist";
opt.prod = "";
opt.concatFileName = "concat.js";
opt.minifyFileName = "KildeviserSearchSDK.min.js";
opt.src = ["src/models/*.js","lib/select2/select2.js","lib/mithril/mithril.min.js","src/app.js","!" + opt.minifyFileName];

//Dependencies:

//Gulp!!!
var gulp = require('gulp');
//Only handles changed files
var changed = require('gulp-changed');
//Minifies html, css and Javascript
var minifier = require('gulp-minifier');
//Watch for changes
var watchify = require('gulp-watchify');
//Put files together in a single file
var concat = require('gulp-concat');
//Remove files and folders
var clean = require('gulp-clean');

//Tasks:

//Minifies Javascript files
gulp.task('minify', watchify(function(){
    gulp.src(opt.src)
    //.pipe(changed(dest))
    .pipe(minifier({
        minify: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        minifyJS: true,
        minifyCSS: true
    }))
    .pipe(concat(opt.minifyFileName))
    .pipe(gulp.dest(opt.dest));
}));

//Concat all .js files
gulp.task('con', function(){
    gulp.src(opt.src)
    .pipe(minifier({
        minify: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        minifyJS: true,
        minifyCSS: true
    }))
    .pipe(concat(opt.concatFileName))
    .pipe(gulp.dest(opt.dest));
});


gulp.task('remove', function () {
    console.log('Removing ' + opt.dest + opt.concatFileName);
    return gulp.src(opt.dest + opt.concatFileName, {read: false})
        .pipe(clean({force: true}));
});


//Concat, no minify (for debugging)
gulp.task('connomini', ['remove'], function(){
    console.log('Concating and minifying ', opt.src);
    gulp.src(opt.src)
    .pipe(concat(opt.concatFileName))
    .pipe(gulp.dest(opt.dest));
});

gulp.task('default',function(){
    console.log('watching ' + opt.src);
    gulp.watch([opt.src], ['connomini']);
});

// Hack to enable configurable watchify watching
var watching = false;
gulp.task('enable-watch-mode', function() { watching = true; });

//Browserify and copy js files
gulp.task('browserify', watchify(function(watchify) {
    return gulp.src(opt.src)
        .pipe(watchify({
            watch:watching
        }))
        .pipe(gulp.dest(opt.dest));
}));

//Move destination files to another folder, defined with "prod"
gulp.task('toprod', function(){
    gulp.src(opt.dest + '/**/*.js')
    .pipe(gulp.dest(opt.prod));
});

//Watchify is based on browserify and enable-watch-mode
gulp.task('watchify', ['enable-watch-mode', 'browserify']);
