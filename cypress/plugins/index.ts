import * as webpackConfig from './webpack.config';

module.exports = (on, config) => {
  const { startDevServer } = require('@cypress/webpack-dev-server');

  on('dev-server:start', (options) =>
    startDevServer({
      options,
      webpackConfig,
    })
  );
  require('@cypress/code-coverage/task')(on, config);
  return config;
};
