const isMatchingPullRequestFor = require('./is-matching-pull-request-for');

const withMatchingPullRequests = plugin => async (...args) => {
  const [pluginConfig, context] = args;
  const { githubRepo } = pluginConfig;
  const {
    envCi: { commit: gitHead },
    options: { baseBranch },
  } = context;
  const matchingPrFilter = isMatchingPullRequestFor(gitHead);
  const { data: openPullRequests = [] } = await githubRepo.getAllPullRequests({
    base: !baseBranch ? 'master' : baseBranch,
    state: 'open',
  });

  return plugin(
    {
      ...pluginConfig,
      pullRequests: openPullRequests.filter(matchingPrFilter),
    },
    ...args.slice(1)
  );
};

module.exports = withMatchingPullRequests;
