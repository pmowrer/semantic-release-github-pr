const debug = require('debug')('semantic-release:github-pr');

/**
 * Takes a git hash and Returns a predicate function that matches against a
 * Github PR object (as returned from the Github API). The git hash matches
 * if it's equal to the PR's `sha` (branch's HEAD) or `merge_commit_sha`
 * (Github's "test merge commit": https://developer.github.com/v3/pulls/#response-1).
 *
 * @param gitHead The git hash to match against.
 */
const isMatchingPullRequestFor = gitHead => ({
  head: { sha },
  merge_commit_sha,
  title,
}) => {
  const result = [sha, merge_commit_sha].includes(gitHead);
  debug(`Matching branch against PR: %o`, title);
  debug(`Branch gitHead: %o`, gitHead);
  debug(`PR sha: %o`, sha);
  debug(`PR merge_commit_sha: %o`, merge_commit_sha);
  debug(`Is PR a match? %o`, result);
  return result;
};

module.exports = isMatchingPullRequestFor;
