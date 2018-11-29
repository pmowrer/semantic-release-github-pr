const {
  /**
   * in semantic-release <= 15.12.0 this function is exported as gitHead, as of
   * semantic-release@15.12.1 this function is exported as getGitHead, here we
   * try to destructure both, and use the new one if the old one doesn't exist
   *
   * @see: https://github.com/semantic-release/semantic-release/compare/v15.12.0...v15.12.1
   * @see: https://github.com/semantic-release/semantic-release/commit/9f5645cfa0a6315149072b5b1c1c7f5bb5eb1fe2
   */
  gitHead: maybeGitHead,
  getGitHead: maybeGetGitHead,
} = require('semantic-release/lib/git');

let getGitHead = maybeGitHead !== undefined ? maybeGitHead : maybeGetGitHead;

/**
 * Plugin wrapper that ensures that `nextRelease.gitHead` is available.
 *
 * Not all plugins receive `nextRelease.gitHead` (available starting w/ `verifyRelease`).
 * This wrapper uses the same method as `semantic-release` to retrieve `gitHead`.
 * https://github.com/semantic-release/semantic-release/blob/754b420fd6f26444eea53155fc0dbd08a51b4dcb/index.js#L38
 * @param plugin
 */
const withGitHead = plugin => async (pluginConfig, context) => {
  const { nextRelease } = context;
  const gitHead = nextRelease ? nextRelease.gitHead : await getGitHead();

  return plugin(pluginConfig, {
    ...context,
    nextRelease: {
      ...nextRelease,
      gitHead,
    },
  });
};

module.exports = withGitHead;
