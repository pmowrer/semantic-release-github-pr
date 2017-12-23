const header = 'Merging this PR will publish the following release:\n\n';

/**
 * Returns a function accepting a Github PR object (as returned by the Github API).
 *
 * @param commentTag
 * @param githubRepo
 * @param logger
 * @param notes
 */
const createChangelog = (commentTag, githubRepo, logger, notes) => async ({
  number,
  title,
}) => {
  logger.log(`Creating changelog comment on PR "${title}"`);
  // To create a general PR comment (unassociated with a line number),
  // we must create it on the corresponding issue that GitHub creates.
  // https://stackoverflow.com/questions/16744069/create-comment-on-pull-request
  await githubRepo.createIssueComment({
    number,
    body: commentTag + header + notes,
  });
};

module.exports = createChangelog;
