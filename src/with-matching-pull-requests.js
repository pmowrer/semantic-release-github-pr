const isMatchingPullRequestFor = require('./is-matching-pull-request-for');

const withMatchingPullRequests = plugin => async (pluginConfig, options) => {
  const { githubRepo, nextRelease: { gitHead }, options: { branch } } = options;
  const matchingPrFilter = isMatchingPullRequestFor(gitHead);
  const { data: openPullRequests = [] } = await githubRepo.getAllPullRequests({
    base: branch,
    state: 'open',
  });

  return plugin(pluginConfig, {
    ...options,
    pullRequests: openPullRequests.filter(matchingPrFilter),
  });
};

module.exports = withMatchingPullRequests;
