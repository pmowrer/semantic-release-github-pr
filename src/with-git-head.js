const { gitHead: getGitHead } = require('semantic-release/lib/git');

/**
 * Plugin wrapper that ensures that `nextRelease.gitHead` is available.
 *
 * Not all plugins receive `nextRelease.gitHead` (available starting w/ `verifyRelease`).
 * This wrapper uses the same method as `semantic-release` to retrieve `gitHead`.
 * https://github.com/semantic-release/semantic-release/blob/754b420fd6f26444eea53155fc0dbd08a51b4dcb/index.js#L38
 * @param plugin
 */
const withGitHead = plugin => async (pluginConfig, config) => {
  const { nextRelease } = config;
  const gitHead = nextRelease ? nextRelease.gitHead : await getGitHead();

  return plugin(pluginConfig, {
    ...config,
    nextRelease: {
      ...nextRelease,
      gitHead,
    },
  });
};

module.exports = withGitHead;
