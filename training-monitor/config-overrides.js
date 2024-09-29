module.exports = function override(config, env) {
  config.devServer = {
    ...config.devServer,
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // Any existing logic for devServer middlewares
      return middlewares;
    },
  };

  return config;
};
