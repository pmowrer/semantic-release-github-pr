const { compose } = require('ramda');
const createChangelog = require('./create-changelog');
const deleteChangelog = require('./delete-changelog');
const withCommentTag = require('./with-comment-tag');
const withGithub = require('./with-github');
const withGitHead = require('./with-git-head');
const withMatchingPullRequests = require('./with-matching-pull-requests');

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

const publish = async (
  pluginConfig,
  { commentTag, githubRepo, logger, pullRequests, nextRelease: { notes } }
) => {
  await pullRequests.forEach(
    createChangelog(commentTag, githubRepo, logger, notes)
  );
};

module.exports = {
  publish: decoratePlugins(publish),
  verifyConditions: decoratePlugins(verifyConditions),
};
