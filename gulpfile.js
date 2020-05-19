///////////////////////////////////////////////////////////////////////////////
// Load dependencies
///////////////////////////////////////////////////////////////////////////////

// Gulp
const { src, dest, series, parallel, watch } = require('gulp');

// Minifier
var minifier = require('gulp-minifier');

// Put files together in a single file
var concat = require('gulp-concat');

// Webserver with LiveReload
var connect = require( 'gulp-connect');

///////////////////////////////////////////////////////////////////////////////
// Options
///////////////////////////////////////////////////////////////////////////////

// Production
var prod = {}
prod.dest = "dist";
prod.fileName = "KildeviserSearchSDK.min.js";
prod.src = [
    "src/models/*.js",
    "lib/select2/js/select2.min.js",
    "lib/mithril/mithril.min.js",
    "src/app.js",
    "!" + prod.fileName
];

// Development
var dev = {}
dev.dest = "dist";
dev.fileName = "KildeviserSearchSDK.js";
dev.src = [
    "src/models/*.js",
    "lib/select2/js/select2.js",
    "lib/mithril/mithril.js",
    "src/app.js",
    "!" + dev.fileName
];
///////////////////////////////////////////////////////////////////////////////
// Tasks
///////////////////////////////////////////////////////////////////////////////

// Concats without minifying for development
function buildDev() {
    return src(dev.src)
        .pipe(concat(dev.fileName))
        .pipe(dest(dev.dest))
}

// Concats and minifies for production
function build() {
    return src(prod.src)
        .pipe(concat(prod.fileName))
        .pipe(minifier({
            minify: true,
            collapseWhitespace: true,
            conservativeCollapse: true,
            minifyJS: true,
            minifyCSS: true
        }))
        .pipe(dest(prod.dest));
}

// Copies assets into dist
function copyAssets(){
    return src('./lib/select2/css/select2.css')
        .pipe(dest('./dist/'));
}

// Starts a development webserver
function startWebserver(callback){
    connect.server({
        root: './',
        livereload: true,
        fallback: '/examples/example.html'
    });

    callback();
}

// Returns a watcher function
function watcher(){
    return watch(['src/**/*.*'], { delay: 500 }, buildDev);
}

///////////////////////////////////////////////////////////////////////////////
// Export gulp commands
///////////////////////////////////////////////////////////////////////////////

exports.build = series(build, copyAssets);
exports.buildDev = series(buildDev, copyAssets);

exports.serve = startWebserver;
exports.watch = series(startWebserver, watcher);