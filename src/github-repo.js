const partiallyApplyParams = params1 => fns =>
  fns.map(fn => params2 => fn({ ...params1, ...params2 }));

// All of the Github API calls we're making require passing `owner` and `repo`.
// This function partially applies these args for the API functions we use.
const githubRepo = (github, { owner, repo }) => {
  const partiallyApplyRepoAndOwner = partiallyApplyParams({ owner, repo });

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

  return {
    createIssueComment,
    deleteIssueComment,
    getAllPullRequests,
    getIssueComments,
  };
};

module.exports = githubRepo;
