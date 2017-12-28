const { compose } = require('ramda');
const { wrapPlugin } = require('semantic-release-plugin-decorators');
const pluginDefinitions = require('semantic-release/lib/plugins/definitions');
const createChangelog = require('./create-changelog');
const deleteChangelog = require('./delete-changelog');
const withCommentTag = require('./with-comment-tag');
const withGithub = require('./with-github');
const withGitHead = require('./with-git-head');
const withMatchingPullRequests = require('./with-matching-pull-requests');

const NAMESPACE = 'githubPr';

const decoratePlugins = compose(
  withGithub,
  withGitHead,
  withMatchingPullRequests,
  withCommentTag
);

// Use `verifyConditions` plugin as a hook to clean up stale changelog comments.
// We can't do this in `publish` since it only runs if there's a new release.
const verifyConditions = async (
  pluginConfig,
  { commentTag, githubRepo, logger, pullRequests }
) => {
  await pullRequests.forEach(deleteChangelog(commentTag, githubRepo, logger));
};

// Use `analyzeCommits` plugin as a hook to post a "no release" PR comment if
// there isn't a new release. We can't do this in `publish` since it only runs
// if there's a new release.
const analyzeCommits = wrapPlugin(
  NAMESPACE,
  'analyzeCommits',
  plugin => async (pluginConfig, config) => {
    const { dryRun } = pluginConfig;
    const nextRelease = await plugin(pluginConfig, config);

    if (!nextRelease && !dryRun) {
      const { commentTag, githubRepo, logger, pullRequests } = config;
      await pullRequests.forEach(
        createChangelog(commentTag, githubRepo, logger, null)
      );
    }

    return nextRelease;
  },
  pluginDefinitions.analyzeCommits.default
);

const publish = async (
  pluginConfig,
  { commentTag, githubRepo, logger, pullRequests, nextRelease: { notes } }
) => {
  await pullRequests.forEach(
    createChangelog(commentTag, githubRepo, logger, notes)
  );
};

module.exports = {
  analyzeCommits: decoratePlugins(analyzeCommits),
  publish: decoratePlugins(publish),
  verifyConditions: decoratePlugins(verifyConditions),
};
