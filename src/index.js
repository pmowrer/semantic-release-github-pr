const { appendStep } = require('semantic-release-plugin-decorators');
const { compose } = require('ramda');
const { parse } = require('./comment-tag');
const createChangelog = require('./create-changelog');
const deleteStaleChangelogs = require('./delete-changelog');
const withGithub = require('./with-github');
const withNpmPackage = require('./with-npm-package');
const withMatchingPullRequests = require('./with-matching-pull-requests');

const decoratePlugin = compose(
  withGithub,
  withMatchingPullRequests,
  withNpmPackage
);

// Use the `analyzeCommits` step to post a "no release" PR comment when there
// isn't a new release (we can't do this in `generateNotes` since it only runs
// if there's a new release).
const analyzeCommits = async (pluginConfig, context) => {
  const { githubRepo, pullRequests } = pluginConfig;
  const { stepResults } = context;
  const hasNextRelease = stepResults.some(result => !!result);

  if (!hasNextRelease) {
    await pullRequests.forEach(async pr => {
      const { number } = pr;
      const createChangelogOnPr = createChangelog(pluginConfig, context);
      const { data: comments } = await githubRepo.getIssueComments({
        number,
      });

      // Create a "no release" comment.
      // We only do this if there are no other comments posted by this plugin,
      // avoiding duplication of the "no release" comment and/or incorrectly posting
      // it when a different package in the same PR has a release (monorepo).
      if (!comments.some(comment => !!parse(comment.body))) {
        createChangelogOnPr(pr);
      }
    });
  }

  // Clean up stale changelog comments from previous runs of this plugin.
  await pullRequests.forEach(
    deleteStaleChangelogs(!hasNextRelease)(pluginConfig, context)
  );

  return;
};

// Use the "generateNotes" step to post a PR comments with the release notes
// generated for the pending release.
const generateNotes = async (pluginConfig, context) => {
  const { pullRequests } = pluginConfig;
  const { nextRelease } = context;

  await pullRequests.forEach(
    // Create a "release" comment.
    createChangelog(pluginConfig, context)
  );

  return nextRelease.notes;
};

module.exports = {
  verifyConditions: '@semantic-release/github',
  analyzeCommits: appendStep('analyzeCommits', decoratePlugin(analyzeCommits)),
  generateNotes: appendStep('generateNotes', decoratePlugin(generateNotes), {
    defaultReturn: '',
  }),
};
