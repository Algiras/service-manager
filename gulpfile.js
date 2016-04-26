/*eslint sort-vars:0,no-console:0*/
'use strict';
var gulp = require('gulp'),
  eslint = require('gulp-eslint'),
  lab = require('gulp-lab');

var workingDirectories = ['./lib/**/*.js', './test/**/*.lab.js'];

gulp.task('test', function () {
  return gulp.src('test')
    .pipe(lab());
});

gulp.task('lint', function () {
  return gulp.src(workingDirectories)
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('default', function () {
  gulp.watch(workingDirectories, ['test', 'lint']);
});
