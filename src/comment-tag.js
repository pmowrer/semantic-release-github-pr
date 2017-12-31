const { equals } = require('ramda');

const create = (gitHead, packageName, gitTag = null) => {
  // There isn't a built-in concept of a markdown comment.
  // We interpret this format as a markdown comment: [//]: # (message)
  // https://stackoverflow.com/questions/4823468/comments-in-markdown/20885980#20885980
  return `[//]: # (semantic-release-github-pr ${gitHead} ${packageName} ${
    gitTag
  })`;
};

const PARSE_REGEXP = /\[\/\/\]: # \(semantic-release-github-pr( [^\)]+)+\)/;

const parse = str => {
  const result = ((str && str.toString()) || '').match(PARSE_REGEXP);
  const matches = (result && result[1].trim().split(' ')) || [];

  if (matches.length === 0) {
    return null;
  }

  return {
    matchesGitHead: equals(matches[0]),
    matchesPackageName: equals(matches[1]),
    matchesGitTag: equals(matches[2]),
  };
};

module.exports = {
  create,
  parse,
};
