const isMatchingPullRequestFor = require('./is-matching-pull-request-for');
const { getCurrentBranchName } = require('./git-utils');

const withMatchingPullRequests = plugin => async (pluginConfig, config) => {
  const { githubRepo } = pluginConfig;
  const { nextRelease: { gitHead }, options: { branch } } = config;
  const matchingPrFilter = isMatchingPullRequestFor(gitHead);
  const { data: openPullRequests = [] } = await githubRepo.getAllPullRequests({
    // Determine whether the user provided a custom `branch` value.
    // If one wasn't provided, we default to "master".
    base: (await getCurrentBranchName()) ? 'master' : branch,
    state: 'open',
  });

  return plugin(
    {
      ...pluginConfig,
      pullRequests: openPullRequests.filter(matchingPrFilter),
    },
    config
  );
};

module.exports = withMatchingPullRequests;
