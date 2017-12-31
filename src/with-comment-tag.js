const readPkg = require('read-pkg');

// Creates a Markdown "comment" used to identify comments posted by this plugin.
// https://stackoverflow.com/a/20885980/89594
const withCommentTag = plugin => async (pluginConfig, config) => {
  const { name: packageName } = await readPkg();
  const commentTag = `[//]: # (semantic-release-github-pr-${packageName})\n`;

  return plugin({ ...pluginConfig, commentTag }, config);
};

module.exports = withCommentTag;
