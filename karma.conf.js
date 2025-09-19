module.exports = function (config) {
  var isParallelDisabled = process && process.env && process.env.npm_lifecycle_event === 'test:no-parallel';

  config.set({
    basePath: '',
    frameworks: [],
    plugins: [],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    // coverageIstanbulReporter NO LONGER HERE
    //coverageIstanbulReporter: {
    //  dir: require('path').join(__dirname, '../../coverage/my-app'),
    //  reports: ['html', 'lcovonly', 'text-summary'],
    //  fixWebpackSourcePaths: true
    //},
    // coverReporter NEWLY ADDED
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'lcov' }, { type: 'json-summary' }],
      fixWebpackSourcePaths: true,
    },
    // THE FOLLOWING REMAINED AS IS
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,
    reportSlowerThan: 500, // Report tests slower than 500ms
  });

  if (isParallelDisabled) {
    config.frameworks.push('jasmine', '@angular-devkit/build-angular');
    config.plugins = [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ];
  } else {
    config.frameworks.push('parallel', 'jasmine', '@angular-devkit/build-angular');
    config.plugins = [
      require('karma-parallel'),
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ];
  }
};
