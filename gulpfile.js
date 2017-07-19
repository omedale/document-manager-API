const gulp = require('gulp');
const mocha = require('gulp-mocha');
const nodemon = require('gulp-nodemon');
const babel = require('gulp-babel');
const istanbul = require('gulp-istanbul');

gulp.task('nodemon', () => {
  nodemon({
    script: 'build/server.js',
    ext: 'js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    watch: ['server']
  });
});

gulp.task('dev', () => {
  return gulp.src('server/**/*.js')
    .pipe(babel({
      presets: ['es2015', 'stage-2']
    }))
    .pipe(gulp.dest('build'));
});

// gulp.task('test', () => {
//   gulp.src(['test/**/*.js'])
//     .pipe(mocha({
//       reporter: 'spec',
//     }));
// });

gulp.task('test', (cb) => {
  gulp.src(['./build/**/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp.src(['./test/server/*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
        .on('end', cb);
    });
});


gulp.task('default', ['nodemon'], () => {
  gulp.watch('server/**/*.js', ['dev']);
});
