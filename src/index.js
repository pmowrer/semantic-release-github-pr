const { compose } = require('ramda');
const {
  wrapPlugin,
  appendMultiPlugin,
} = require('semantic-release-plugin-decorators');
const pluginDefinitions = require('semantic-release/lib/definitions/plugins');

const { parse } = require('./comment-tag');
const createChangelog = require('./create-changelog');
const deleteStaleChangelogs = require('./delete-changelog');
const withGithub = require('./with-github');
const withGitHead = require('./with-git-head');
const withNpmPackage = require('./with-npm-package');
const withMatchingPullRequests = require('./with-matching-pull-requests');

const NAMESPACE = 'githubPr';

const decoratePlugin = compose(
  withGithub,
  withGitHead,
  withMatchingPullRequests,
  withNpmPackage
);

// Use `analyzeCommits` plugin as a hook to post a "no release" PR comment if
// there isn't a new release. We can't do this in `generateNotes` since it only runs
// if there's a new release.
const analyzeCommits = wrapPlugin(
  NAMESPACE,
  'analyzeCommits',
  plugin => async (pluginConfig, context) => {
    const { githubRepo, pullRequests } = pluginConfig;
    const nextRelease = await plugin(pluginConfig, context);

    if (!nextRelease) {
      await pullRequests.forEach(async pr => {
        const { number } = pr;
        const createChangelogOnPr = createChangelog(pluginConfig, context);
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

    // Clean up stale changelog comments, possibly sparing the "no release"
    // comment if this package doesn't have a new release.
    await pullRequests.forEach(
      deleteStaleChangelogs(!nextRelease)(pluginConfig, context)
    );

    return nextRelease;
  },
  pluginDefinitions.analyzeCommits.default
);

// Append a plugin that generates PR comments from the release notes resulting
// from the configured `generateNotes` plugins that run ahead of it.
const generateNotes = appendMultiPlugin(
  NAMESPACE,
  'generateNotes',
  decoratePlugin(async (pluginConfig, context) => {
    const { pullRequests } = pluginConfig;
    const { nextRelease } = context;

    await pullRequests.forEach(
      // Create "release" comment
      createChangelog(pluginConfig, context)
    );

    return nextRelease.notes;
  }),
  pluginDefinitions.generateNotes.default
);

module.exports = {
  verifyConditions: '@semantic-release/github',
  analyzeCommits: decoratePlugin(analyzeCommits),
  generateNotes,
};
