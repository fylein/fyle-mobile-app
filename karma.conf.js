module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['parallel', 'jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-parallel'),
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'), // NEWLY ADDED
      // ORIGINALLY HERE NOW REMOVED require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
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
    browsers: ['ChromeHeadless'],
    singleRun: false,
    restartOnFileChange: true,
  });
};
