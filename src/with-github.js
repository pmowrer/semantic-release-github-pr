const githubInit = require('./github-init');
const githubRepo = require('./github-repo');
const parseGithubUrl = require('parse-github-url');

const withGithub = plugin => (pluginConfig, config) => {
  const github = githubInit(pluginConfig);
  const { options: { repositoryUrl } } = config;
  const { name: repo, owner } = parseGithubUrl(repositoryUrl);

  return plugin(pluginConfig, {
    ...config,
    githubRepo: githubRepo(github, { owner, repo }),
  });
};

module.exports = withGithub;
