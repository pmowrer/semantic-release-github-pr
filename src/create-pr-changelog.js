const debug = require('debug')('semantic-release:github-pr');
const readPkg = require('read-pkg');

const partiallyApplyParams = params1 => fns =>
  fns.map(fn => params2 => fn({ ...params1, ...params2 }));

const header = 'Merging this PR will publish the following release:\n\n';

// Creates a Markdown "comment" used to identify comments posted by this plugin.
// https://stackoverflow.com/a/20885980/89594
const createCommentTag = async () => {
  const { name: packageName } = await readPkg();
  return `[//]: # (semantic-release-github-pr-${packageName})\n`;
};

const isPrFor = gitHead => ({ head: { sha }, merge_commit_sha, title }) => {
  const result = [sha, merge_commit_sha].includes(gitHead);
  debug(`Matching branch against PR: %o`, title);
  debug(`Branch gitHead: %o`, gitHead);
  debug(`PR sha: %o`, sha);
  debug(`PR merge_commit_sha: %o`, merge_commit_sha);
  debug(`Is PR a match? %o`, result);
  return result;
};

const createPrChangelog = async (
  github,
  { branch, gitHead, logger, notes, owner, repo }
) => {
  const partiallyApplyRepoAndOwner = partiallyApplyParams({ owner, repo });
  const commentTag = await createCommentTag();

  // All of the Github API calls we're making require passing `owner` and `repo`.
  // The following section partially applies these args for all API functions used.
  let {
    issues: {
      createComment: createIssueComment,
      deleteComment: deleteIssueComment,
      getComments: getIssueComments,
    },
    pullRequests: { getAll: getAllPullRequests },
  } = github;

  [
    createIssueComment,
    deleteIssueComment,
    getAllPullRequests,
    getIssueComments,
  ] = partiallyApplyRepoAndOwner([
    createIssueComment,
    deleteIssueComment,
    getAllPullRequests,
    getIssueComments,
  ]);

  const { data: openPullRequests = [] } = await getAllPullRequests({
    base: branch,
    state: 'open',
  });

  // We want to comment on any PR of the given branch/head combo.
  // Depending on whether we run on a "pr" or a "push", `gitHead` on CI may be either
  // of `sha` (branch's HEAD) or `merge_commit_sha` (Github's "test merge commit").
  // https://developer.github.com/v3/pulls/#response-1
  openPullRequests
    .filter(isPrFor(gitHead))
    .forEach(async ({ number, title }) => {
      const { data: comments } = await getIssueComments({ number });

      // To keep from spamming each PR with comments, we identify any previous
      // comments posted by this plugin (using `commentTag`) and delete them.
      comments.forEach(async ({ id, body }) => {
        if (body.includes(commentTag)) {
          await deleteIssueComment({ id });
        }
      });

      logger.log(`Creating changelog comment on PR "${title}"`);
      // To create a general PR comment (unassociated with a line number),
      // you must create it on the corresponding issue that GitHub creates.
      // https://stackoverflow.com/questions/16744069/create-comment-on-pull-request
      await createIssueComment({
        number,
        body: commentTag + header + notes,
      });
    });
};

module.exports = createPrChangelog;
