const parseGithubUrl = require('parse-github-url');
const githubInit = require('./src/github-init');
const createPrChangelog = require('./src/create-pr-changelog');

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
