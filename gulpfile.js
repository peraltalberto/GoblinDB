'use strict';

var gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    debug = require('gulp-debug'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    jsdoc = require('gulp-jsdoc3');
    var uglify = require('gulp-uglify');
    var concat = require('gulp-concat');
  
    var source = require('vinyl-source-stream');

    var insert = require('gulp-insert');
    var replace = require('gulp-replace');

    var streamify = require('gulp-streamify');

    var browserify = require('browserify');

    var merge = require('merge-stream');
    var collapse = require('bundle-collapser/plugin');

    var browserify = require('browserify');

var pack = require('./package.json');

var outDir = './dist/';
var header = "/*!\n" +
" * Goblin.js\n" +
" * http://chartjs.org/\n" +
" * Version: {{ version }}\n" +
" *\n" +
" */\n";


gulp.task('jsdoc', function(cb) {
    var config = require('./docs/jsdoc.json');
    gulp.src(['./docs/README.md', './**/*.js', '!./gulp-tasks/**', '!./docs/**', '!./dist/**', '!./node_modules/**', '!./test/**.js', '!gulpfile.js', '!./coverage'], {read: false})
    .pipe(debug({title: 'JSDoc (Scope):'}))
    .pipe(jsdoc(config, cb));
});

gulp.task('test', function (cb) {
    gulp.src(['./src/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire()) 
    .on('finish', function () {
        gulp.src(['./test/*.js'])
        .pipe(mocha())
	.pipe(istanbul.writeReports())
	.pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
	.on('end', cb);
    });
});

gulp.task('lint', function() {
    var filesToLint = [
        '**/*.{html,js}',
        '!tests/protractor.conf.js',
        '!dist/**/*',
        '!docs/**/*',
        '!node_modules/**/*',
        '!tmp/**/*',
        '!coverage/**/*'
    ];

    return gulp.src(filesToLint)
            .pipe(debug({title: 'eslint (Scope):'}))
            .pipe(eslint())
            .pipe(eslint({fix:true}))
            .pipe(eslint.format())
            .pipe(gulp.dest('.'));
});

gulp.task('build',function() {
    
      var bundled = browserify('./goblin.js', { standalone: 'Goblin' })
        .plugin(collapse)
        .bundle()
        .pipe(source('Goblin.bundle.js'))
        .pipe(insert.prepend(header))
        .pipe(streamify(replace('{{ version }}', pack.version)))
        .pipe(gulp.dest(outDir))

        .pipe(insert.prepend(header))
        .pipe(streamify(replace('{{ version }}', pack.version)))
        .pipe(streamify(concat('Goblin.bundle.min.js')))
        .pipe(gulp.dest(outDir));
    
      var nonBundled = browserify('./goblin.js', { standalone: 'Goblin' })
        .ignore('moment')
        .plugin(collapse)
        .bundle()
        .pipe(source('Goblin.js'))
        .pipe(insert.prepend(header))
        .pipe(streamify(replace('{{ version }}', pack.version)))
        .pipe(gulp.dest(outDir))
   
        .pipe(insert.prepend(header))
        .pipe(streamify(replace('{{ version }}', pack.version)))
        .pipe(streamify(concat('Goblin.min.js')))
        .pipe(gulp.dest(outDir));
    
      return merge(bundled, nonBundled);
    
    });