const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    utils: './src/utils.js',
    components: './src/components.js',
  },
  devServer: {
    open: true,
    static: {
      directory: path.join(__dirname),
      watch: true,
    },
    port: 3000,
  },
};
