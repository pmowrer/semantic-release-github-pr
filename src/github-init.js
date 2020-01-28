const resolveConfig = require('@semantic-release/github/lib/resolve-config');
const GitHubApi = require('github');
const { parse } = require('url');

/**
 * Implementation lifted from `semantic-release`'s default Github plugin:
 * https://github.com/semantic-release/github/blob/d49ce22a7c2d4b0861de31ba00c0b213b23e5051/lib/publish.js#L11
 *
 * @param pluginConfig The config object passed to `semantic-release` plugins.
 * @param context The context object passed to `semantic-release` plugins.
 * @returns An initialized instance of `github`.
 */
module.exports = (pluginConfig, context) => {
  const { githubToken, githubUrl, githubApiPathPrefix } = resolveConfig(
    pluginConfig,
    context
  );

  let { port, protocol, hostname: host } = githubUrl ? parse(githubUrl) : {};
  protocol = (protocol || '').split(':')[0] || null;

  const github = new GitHubApi({
    port,
    protocol,
    host,
    pathPrefix: githubApiPathPrefix,
  });

  github.authenticate({ type: 'token', token: githubToken });

  return github;
};
