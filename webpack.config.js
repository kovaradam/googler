const path = require('path');

module.exports = {
  mode: 'development',
  devServer: {
    open: true,
    static: {
      directory: path.join(__dirname),
    },
    compress: true,
    port: 3000,
  },
};
