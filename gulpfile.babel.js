import gulp from 'gulp';
import gutil from 'gulp-util';
import del from 'del';
import webpack from 'webpack';
import config from './webpack.config.babel';
import through2 from 'through2';
import path from 'path';
import pkg from './package.json';

gulp.task('clean', () => {
  return del([
    'dist/**'
  ]);
});

gulp.task('build', ['clean', 'webpack:build', 'addErrorHandler', 'modifyJs']);

gulp.task('webpack:build', ['clean'], (callback) => {
  webpack(config, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack:build', err);
    }

    if (stats.hasErrors()) {
      throw new gutil.PluginError('webpack:build', stats.toString({
        colors: true,
        entrypoints: false,
        chunks: false,
        chunkModules: false,
        chunkOrigins: false,
        children: false,
        errorDetails: true
      }));
    }

    gutil.log('[webpack:build]', stats.toString({
      colors: true,
      entrypoints: false,
      chunks: false,
      chunkModules: false,
      chunkOrigins: false,
      children: false,
      errorDetails: true
    }));

    callback();
  });
});

gulp.task('addErrorHandler', ['webpack:build'], () => {
  const onErrorAttr = 'onerror="__resLoadError__()"';

  const addScriptTiming = (scriptStartTag, key) => {
    const resultKey = key === 'commons' ? key : 'main';
    const jsTimingBegin = `<script>window.__cfpJSLoadTiming__['${resultKey}LoadJsTimingBegin'] = Date.now();</script>`;
    const onloadAttr = `onload="window.__cfpJSLoadTiming__['${resultKey}LoadJsTimingEnd'] = Date.now();"`;
    return `${jsTimingBegin}${scriptStartTag} ${onloadAttr}`;
  };
  const addScriptEndPoint = (scriptEndTag, key) => {
    const resultKey = key === 'commons' ? key : 'main';
    const jsTimingEnd2 = `<script>window.__cfpJSLoadTiming__['${resultKey}LoadJsTimingEnd2'] = Date.now();</script>`;
    return `${scriptEndTag}${jsTimingEnd2}`;
  };

  return gulp.src('dist/**/*.html')
    .pipe(through2.obj(function(file, enc, cb) {
      const html = file.contents.toString()
        .replace(/<link[^>]+?(rel="stylesheet")[^>]*?>/ig, (link, $1) => link.replace($1, `${$1} ${onErrorAttr}`))
        .replace(/(<script)[^>]+?src=(['"])(.+?)\2[^>]*?>/ig, (script, $1) => script.replace($1, `${$1} ${onErrorAttr}`))
        .replace(/(<script)[^>]+?src=(['"])\/(.+?)_.+?\2[^>]*?(><\/script>)/ig, (script, $1, $2, $3, $4) => {
          return script.replace($1, addScriptTiming($1, $3))
            .replace($4, addScriptEndPoint($4, $3));
        });
      file.contents = new Buffer(html);
      this.push(file);
      cb();
    }))
    .pipe(gulp.dest('dist'));
});

//先只给home/index的mainJs中外层包裹setTimeout,用以提前android的onPageFinished事件,解决frogDiff耗时较长问题
gulp.task('modifyJs', ['webpack:build'], () => {

  return gulp.src('dist/home/index_*.js')
    .pipe(through2.obj(function(file, enc, cb) {
      this.push(file);
      cb();
    }))
    .pipe(gulp.dest('dist/home'));
});

gulp.task('default', ['build']);
