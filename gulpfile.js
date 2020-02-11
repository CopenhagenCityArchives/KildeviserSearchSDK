// Dependencies:

// Gulp
const { src, dest, series, parallel, watch } = require('gulp');

// Minifier
var minifier = require('gulp-minifier');

// Put files together in a single file
var concat = require('gulp-concat');

// Webserver with LiveReload
var connect = require( 'gulp-connect');

//Options
var opt = {};


opt.dest = "dist";
opt.prod = "";
opt.concatFileName = "concat.js";
opt.minifyFileName = "KildeviserSearchSDK.min.js";
opt.src = ["src/models/*.js","lib/select2/select2.min.js","lib/mithril/mithril.min.js","src/app.js","!" + opt.minifyFileName];


//Tasks:

//Minifies Javascript files
function build(){
    return src(opt.src)
        .pipe(minifier({
            minify: true,
            collapseWhitespace: true,
            conservativeCollapse: true,
            minifyJS: true,
            minifyCSS: true
        }))
        .pipe(concat(opt.minifyFileName))
        .pipe(dest(opt.dest));
}

function copyAssets(){
    return src('./lib/select2/select2.css')
        .pipe(dest('./dist/'));
}

function startWebserver(cb){
    
    connect.server({
        root: './',
        livereload: true,
        fallback: '/examples/example.html'
      });

      cb();
}

function watcher(){
    return watch(['src/**/*.*'], { delay: 500 }, build);
}

exports.build = series(build, copyAssets);
exports.serve = startWebserver;
exports.watch = series(startWebserver, watcher);