const parseGithubUrl = require('parse-github-url');
const githubInit = require('./github-init');
const createPrChangelog = require('./create-pr-changelog');

const plugin = async (
  pluginConfig,
  {
    logger,
    nextRelease: { gitHead, notes },
    options: { branch, repositoryUrl },
  }
) => {
  const github = githubInit(pluginConfig);
  const { name: repo, owner } = parseGithubUrl(repositoryUrl);

  await createPrChangelog(github, {
    branch,
    gitHead,
    logger,
    notes,
    owner,
    repo,
  });
};

module.exports = {
  publish: plugin,
};
