#!/usr/bin/env node
const execa = require('execa');
const { argv } = process;
const { resolve } = require('path');
const { getCurrentBranchName } = require('../src/git-utils');

(async function() {
  const plugins = `${resolve(__dirname, '../src/index.js')}`;
  const branch = await getCurrentBranchName();

  const args = argv.slice(2).concat([
    // We want to run on pull request builds, but `semantic-release` won't
    // let us unless we pass `--no-ci`.
    // https://github.com/semantic-release/semantic-release/issues/584
    `--no-ci`,
    // Set `dry-run` to keep `semantic-release` from publishing an actual release.
    `--dry-run`,
    `--branches=${branch}`,
    `--extends=${plugins}`,
  ]);

  execa('semantic-release', args, { stdio: 'inherit', preferLocal: true });
})();
