const { compose } = require('ramda');
const { wrapPlugin } = require('semantic-release-plugin-decorators');
const pluginDefinitions = require('semantic-release/lib/plugins/definitions');

const createChangelog = require('./create-changelog');
const deleteChangelog = require('./delete-changelog');
const withGithub = require('./with-github');
const withGitHead = require('./with-git-head');
const withNpmPackage = require('./with-npm-package');
const withMatchingPullRequests = require('./with-matching-pull-requests');

const NAMESPACE = 'githubPr';

const decoratePlugins = compose(
  withGithub,
  withGitHead,
  withMatchingPullRequests,
  withNpmPackage
);

// Use `verifyConditions` plugin as a hook to clean up stale changelog comments.
// We can't do this in `publish` since it only runs if there's a new release.
const verifyConditions = async (pluginConfig, config) => {
  const { pullRequests } = pluginConfig;
  await pullRequests.forEach(deleteChangelog(pluginConfig, config));
};

// Use `analyzeCommits` plugin as a hook to post a "no release" PR comment if
// there isn't a new release. We can't do this in `publish` since it only runs
// if there's a new release.
const analyzeCommits = wrapPlugin(
  NAMESPACE,
  'analyzeCommits',
  plugin => async (pluginConfig, config) => {
    const { dryRun, commentTag, pullRequests } = pluginConfig;
    const nextRelease = await plugin(pluginConfig, config);

    if (!nextRelease && !dryRun) {
      // Create "no release" comment
      const { logger } = config;
      await pullRequests.forEach(createChangelog(pluginConfig, config));
    }

    return nextRelease;
  },
  pluginDefinitions.analyzeCommits.default
);

const publish = async (pluginConfig, config) => {
  const { pullRequests } = pluginConfig;
  await pullRequests.forEach(
    // Create "release" comment
    createChangelog(pluginConfig, config)
  );
};

module.exports = {
  analyzeCommits: decoratePlugins(analyzeCommits),
  publish: decoratePlugins(publish),
  verifyConditions: decoratePlugins(verifyConditions),
};
