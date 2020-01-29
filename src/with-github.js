const githubInit = require('./github-init');
const githubRepo = require('./github-repo');
const parseGithubUrl = require('parse-github-url');

const withGithub = plugin => (pluginConfig, context) => {
  const github = githubInit(pluginConfig, context);
  const {
    options: { repositoryUrl },
  } = context;
  const { name: repo, owner } = parseGithubUrl(repositoryUrl);

  return plugin(
    {
      ...pluginConfig,
      githubRepo: githubRepo(github, { owner, repo }),
    },
    context
  );
};

module.exports = withGithub;
