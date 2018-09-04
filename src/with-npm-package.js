const readPkg = require('read-pkg');

const withNpmPackage = plugin => async (pluginConfig, context) => {
  const npmPackage = await readPkg();
  return plugin({ ...pluginConfig, npmPackage }, context);
};

module.exports = withNpmPackage;
