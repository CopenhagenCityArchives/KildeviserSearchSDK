///////////////////////////////////////////////////////////////////////////////
// Load dependencies
///////////////////////////////////////////////////////////////////////////////

// Gulp
const { src, dest, series, parallel, watch } = require('gulp');

// for arguments
const minimist = require('minimist');

// Minifier
var minifier = require('gulp-minifier');

// Put files together in a single file
var concat = require('gulp-concat');

// Webserver with LiveReload
var connect = require( 'gulp-connect');

///////////////////////////////////////////////////////////////////////////////
// Options
///////////////////////////////////////////////////////////////////////////////

// Setup profile based on CLI flag --profile
var argv = minimist(process.argv.slice(2));
var profile = argv.profile;

if (!profile) {
    profile = "kbharkiv";
}

if (profile != "kbharkiv" && profile != "frederiksberg") {
    throw new Error("Invalid profile '"+profile+"'");
} else {
    console.log('Using profile: ' + profile);
}

var srcCss = [
    './profile/' +profile+ '.css',
    './node_modules/select2/dist/css/select2.css',
    './node_modules/@ttskch/select2-bootstrap4-theme/dist/select2-bootstrap4.css'
];

var srcJs = [
    "profile/"+profile+".js",
    "src/models/*.js",
    "./node_modules/select2/dist/js/select2.js",
    "./node_modules/mithril/mithril.js",
    "src/app.js"
];

// Production
var prod = {
    dest: 'dist',
    fileName: 'KildeviserSearchSDK.min.js'
}

// Development
var dev = {
    dest: 'dist',
    fileName: 'KildeviserSearchSDK.js'
}

///////////////////////////////////////////////////////////////////////////////
// Tasks
///////////////////////////////////////////////////////////////////////////////

// Concats without minifying for development
function buildDev() {
    return src(srcJs)
        .pipe(concat(dev.fileName))
        .pipe(dest(dev.dest))
}

// Concats and minifies for production
function build() {
    return src(srcJs)
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

function buildCssDev(){
    return src(srcCss)
        .pipe(concat('KildeviserSearchSDK.css'))
        .pipe(dest('./dist/'));
}

function buildCss(){
    return src(srcCss)
        .pipe(concat('KildeviserSearchSDK.min.css'))
        .pipe(minifier({
            minify: true,
            collapseWhitespace: true,
            conservativeCollapse: true,
            minifyJS: true,
            minifyCSS: true
        }))
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
    return watch(['src/**/*.*', 'profile/*.*'], { delay: 500 }, series(buildDev, buildCssDev));
}

///////////////////////////////////////////////////////////////////////////////
// Export gulp commands
///////////////////////////////////////////////////////////////////////////////

exports.build = series(build, buildCss);
exports.buildDev = series(buildDev, buildCssDev);

exports.serve = startWebserver;
exports.watch = series(buildDev, buildCssDev, startWebserver, watcher);