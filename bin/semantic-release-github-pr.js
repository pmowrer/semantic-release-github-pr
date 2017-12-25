#!/usr/bin/env node
const execa = require('execa');
const { argv } = process;
const { resolve } = require('path');
const plugins = `${resolve(__dirname, '../src/index.js')}`;

const args = argv
  .slice(2)
  .concat([
    `--analyze-commits=${plugins}`,
    `--verify-conditions=@semantic-release/github,${plugins}`,
    `--publish=${plugins}`,
  ]);

execa('semantic-release', args, { stdio: 'inherit' });
