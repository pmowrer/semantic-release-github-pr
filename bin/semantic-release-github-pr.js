#!/usr/bin/env node
const execa = require('execa');
const { argv } = process;
const { resolve } = require('path');

const args = argv
  .slice(2)
  .concat([
    '--verify-conditions=@semantic-release/github',
    `--publish=${resolve(__dirname, '../src/index.js')}`,
  ]);

execa('semantic-release', args, { stdio: 'inherit' });
