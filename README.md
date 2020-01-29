# semantic-release-github-pr

[![Build Status](https://travis-ci.org/pmowrer/semantic-release-github-pr.svg?branch=master)](https://travis-ci.org/pmowrer/semantic-release-github-pr) [![npm](https://img.shields.io/npm/v/semantic-release-github-pr.svg)](https://www.npmjs.com/package/semantic-release-github-pr) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Preview the semantic release notes that would result from merging a Github PR.

![image](https://user-images.githubusercontent.com/356320/33625928-257bc906-d9c7-11e7-9adb-de85726952eb.png)

This [`semantic-release`](https://github.com/semantic-release/semantic-release) plugin will post a Github PR comment with a preview of the release that would result from merging.

## Install

```bash
npm install -D semantic-release semantic-release-github-pr
```

## Usage

```bash
npx semantic-release-github-pr
```

It helps to think about `semantic-release-github-pr` as a variation on `semantic-release`'s default behavior, using the latter's plugin system to modify some behaviors:

* If a new release would result from running `semantic-release`, _instead of publishing a new release of a package_, it posts a comment with the changelog to matching Github PRs.

* It posts a static message when there's no release (for clarity).

* It cleans up any PR comments it previously made (to keep from flooding PRs or leaving outdated information).

### Which PRs get a comment?

A PR gets a comment if:

1.  The PR's _from_ branch matches the current branch (that this plugin is being run on).

    To cover multiple CI scenarios ([see below](#ci)), either of:

    1.  The PR's [_test_ merge commit](https://developer.github.com/v3/pulls/#response-1) matches the current branch's `git` HEAD.
    2.  The PR and the current branch have the same `git` HEAD.

2.  The PR's base branch matches `master` (default) unless otherwise configured via the `baseBranch` option.

## Configuration

It is assumed the user is already fully familiar with `semantic-release` and [`its workflow`](https://github.com/semantic-release/semantic-release#how-does-it-work).

### Github

Github authentication must be configured, exactly the same as for `semantic-relase`'s default [`@semantic-release/github`](https://github.com/semantic-release/github/#github-authentication) plugin. PR comments will be posted by the associated GitHub user.

### Release config

It's possible to configure the expected base branch [when matching a PR](#which-prs-get-a-comment) via a `baseBranch` option set in the [release config](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration-file).

E.g., in a `package.json` release config:

```json
{
  "release": {
    "baseBranch": "staging"
  }
}
```

### CI

This plugin is best used with a CI build process to fully automate the posting of comments in Github PRs. Ideally, it should run whenever a PR is opened/updated.

#### Travis

To only run when necessary, we use the [`$TRAVIS_PULL_REQUEST`](https://docs.travis-ci.com/user/environment-variables/#Convenience-Variables) environment variable to detect whether the build is a ["pull request build"](https://docs.travis-ci.com/user/pull-requests/).

```yaml
after_success:
  - "[[ $TRAVIS_PULL_REQUEST != 'false' ]] && npx semantic-release-github-pr || exit 0"
```

#### CircleCI

To run only when necessary, we use the [`$CI_PULL_REQUEST`](https://circleci.com/docs/1.0/environment-variables/#build-details) environment variable to detect whether the build has a corresponding pull request.

Unfortunately, CircleCI only supports building on push, [not when a PR is created](https://discuss.circleci.com/t/trigger-new-build-on-pr/4219). This limits the usefulness of the plugin somewhat, as a build will have to be triggered manually after a PR is opened for the changelog to post.

```yaml
post:
  - "[[ $CI_PULL_REQUEST != '' ]] && npx semantic-release-github-pr || exit 0"
```
