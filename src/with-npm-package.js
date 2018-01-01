const readPkg = require('read-pkg');

const withNpmPackage = plugin => async (pluginConfig, config) => {
  const npmPackage = await readPkg();
  return plugin({ ...pluginConfig, npmPackage }, config);
};

module.exports = withNpmPackage;
