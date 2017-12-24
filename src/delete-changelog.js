/**
 * To keep from spamming each PR with comments, we identify any previous
 * comments posted by this plugin (using `commentTag`) and delete them.
 *
 * Returns a function accepting a Github PR object (as returned by the Github API).
 *
 * @param commentTag
 * @param githubRepo
 * @param logger
 */
const deleteChangelog = (commentTag, githubRepo, logger) => async ({
  number,
  title,
}) => {
  const { data: comments } = await githubRepo.getIssueComments({ number });

  comments.forEach(async ({ id, body }) => {
    if (body.includes(commentTag)) {
      logger.log(`Deleting stale changelog comment on PR "${title}"`);
      await githubRepo.deleteIssueComment({ id });
    }
  });
};

module.exports = deleteChangelog;
