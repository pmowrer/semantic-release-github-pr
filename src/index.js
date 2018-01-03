const { compose } = require('ramda');
const { wrapPlugin } = require('semantic-release-plugin-decorators');
const pluginDefinitions = require('semantic-release/lib/plugins/definitions');

const { parse } = require('./comment-tag');
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
    const { dryRun, githubRepo, pullRequests } = pluginConfig;
    const nextRelease = await plugin(pluginConfig, config);

    if (!nextRelease && !dryRun) {
      await pullRequests.forEach(async pr => {
        const { number } = pr;
        const createChangelogOnPr = createChangelog(pluginConfig, config);
        const { data: comments } = await githubRepo.getIssueComments({
          number,
        });

        // Create "no release" comment if there are no other comments posted
        // by this set of plugins. We want to avoid duplicating the "no release"
        // comment and/or posting it when another package has a release (monorepo).
        if (!comments.some(comment => !!parse(comment.body))) {
          createChangelogOnPr(pr);
        }
      });
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
