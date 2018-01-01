const { parse } = require('./comment-tag');

/**
 * We could just consider all previous comments stale, but to be compatible
 * with `semantic-release-monorepo`, we take care not to remove comments
 * made with the same `gitHead` but a different `npmPackageName`. Comments
 * fitting that criteria would only exist in a monorepo scenario.
 *
 * Lastly, the "no release" comment, as identified by a `null` git tag, should
 * always be wiped because we'd only want a single one in any scenario.
 * @param {String} gitHead
 * @param {String} npmPackageName
 * @returns {Function} Returns a predicate function accepting a string to match
 * for a stale comment.
 */
const matchStaleComment = (gitHead, npmPackageName) => comment => {
  const result = parse(comment);
  return (
    result &&
    (!result.matchesGitHead(gitHead) ||
      result.matchesPackageName(npmPackageName) ||
      result.matchesGitTag(null))
  );
};

/**
 * To keep from spamming each PR with comments, we identify any previous
 * comments posted by this plugin (using `commentTag`) and delete them.
 *
 * Returns a function accepting a Github PR object (as returned by the Github API).
 *
 * @param pluginConfig
 * @param config
 */
const deleteChangelog = (
  { githubRepo, npmPackage: { name: npmPackageName } },
  { logger, nextRelease: { gitHead } }
) => async ({ number, title }) => {
  const { data: comments } = await githubRepo.getIssueComments({ number });
  const isStaleComment = matchStaleComment(gitHead, npmPackageName);

  comments.forEach(async ({ id, body }) => {
    if (isStaleComment(body)) {
      logger.log(`Deleting stale changelog comment on PR "${title}"`);
      await githubRepo.deleteIssueComment({ id });
    }
  });
};

module.exports = deleteChangelog;
