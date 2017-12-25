const isMatchingPullRequestFor = require('./is-matching-pull-request-for');

const withMatchingPullRequests = plugin => async (pluginConfig, config) => {
  const { githubRepo, nextRelease: { gitHead }, options: { branch } } = config;
  const matchingPrFilter = isMatchingPullRequestFor(gitHead);
  const { data: openPullRequests = [] } = await githubRepo.getAllPullRequests({
    base: branch,
    state: 'open',
  });

  return plugin(pluginConfig, {
    ...config,
    pullRequests: openPullRequests.filter(matchingPrFilter),
  });
};

module.exports = withMatchingPullRequests;
