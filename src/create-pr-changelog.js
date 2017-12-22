const debug = require('debug')('semantic-release:github-pr');
const readPkg = require('read-pkg');
const githubRepo = require('./github-repo');

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
  const git = githubRepo(github, { owner, repo });
  const commentTag = await createCommentTag();

  const { data: openPullRequests = [] } = await git.getAllPullRequests({
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
      const { data: comments } = await git.getIssueComments({ number });

      // To keep from spamming each PR with comments, we identify any previous
      // comments posted by this plugin (using `commentTag`) and delete them.
      comments.forEach(async ({ id, body }) => {
        if (body.includes(commentTag)) {
          await git.deleteIssueComment({ id });
        }
      });

      logger.log(`Creating changelog comment on PR "${title}"`);
      // To create a general PR comment (unassociated with a line number),
      // you must create it on the corresponding issue that GitHub creates.
      // https://stackoverflow.com/questions/16744069/create-comment-on-pull-request
      await git.createIssueComment({
        number,
        body: commentTag + header + notes,
      });
    });
};

module.exports = createPrChangelog;
