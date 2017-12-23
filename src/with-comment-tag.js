const readPkg = require('read-pkg');

// Creates a Markdown "comment" used to identify comments posted by this plugin.
// https://stackoverflow.com/a/20885980/89594
const withCommentTag = plugin => async (pluginConfig, options) => {
  const { name: packageName } = await readPkg();
  const commentTag = `[//]: # (semantic-release-github-pr-${packageName})\n`;

  return plugin(pluginConfig, { ...options, commentTag });
};

module.exports = withCommentTag;
