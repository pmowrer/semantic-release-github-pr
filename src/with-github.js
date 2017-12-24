const githubInit = require('./github-init');
const githubRepo = require('./github-repo');
const parseGithubUrl = require('parse-github-url');

const withGithub = plugin => (pluginConfig, options) => {
  const github = githubInit(pluginConfig);
  const { options: { repositoryUrl } } = options;
  const { name: repo, owner } = parseGithubUrl(repositoryUrl);

  return plugin(pluginConfig, {
    ...options,
    githubRepo: githubRepo(github, { owner, repo }),
  });
};

module.exports = withGithub;
