const execa = require('execa');

const git = async (args, options = {}) => {
  const { stdout } = await execa('git', args, options);
  return stdout;
};

/**
 * https://stackoverflow.com/a/12142066/89594
 * @async
 * @return {Promise<String>} The current branch name.
 */
const getCurrentBranchName = () => git(['rev-parse', '--abbrev-ref', 'HEAD']);

module.exports = {
  getCurrentBranchName,
};
