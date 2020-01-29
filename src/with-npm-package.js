const readPkg = require('read-pkg');

const withNpmPackage = plugin => async (...args) => {
  const [pluginConfig] = args;
  const npmPackage = await readPkg();
  return plugin({ ...pluginConfig, npmPackage }, ...args.slice(1));
};

module.exports = withNpmPackage;
