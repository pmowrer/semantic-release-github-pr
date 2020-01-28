# semantic-release-github-pr

[![Build Status](https://travis-ci.org/pmowrer/semantic-release-github-pr.svg?branch=master)](https://travis-ci.org/pmowrer/semantic-release-github-pr) [![npm](https://img.shields.io/npm/v/semantic-release-github-pr.svg)](https://www.npmjs.com/package/semantic-release-github-pr) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Preview the semantic release notes that would result from merging a Github PR.

![image](https://user-images.githubusercontent.com/356320/33625928-257bc906-d9c7-11e7-9adb-de85726952eb.png)

This set of [`semantic-release`](https://github.com/semantic-release/semantic-release) plugins will post a Github PR comment with a preview of the release that would result from merging.

## Install

```bash
npm install -D semantic-release@~15.9.x semantic-release-github-pr
```

NOTE: The current version of this plugin only supports `semantic-release` versions 15.7.x-15.9.x. The next major version will support the current version of `semantic-release`.

## Usage

```bash
npx semantic-release-github-pr
```

It helps to think about `semantic-release-github-pr` as a variation on `semantic-release`'s default behavior, using the latter's plugin system to modify some behaviors:

* If a new release would result from running `semantic-release`, _instead of publishing a new release of a package to `npm`_, it posts a comment with the changelog to matching Github PRs.

* It posts a static message when there's no release (for clarity).

* It cleans up any PR comments it previously made (to keep from flooding PRs or leaving outdated information).

### Which PRs get a comment?

A PR gets a comment if:

1.  The PR's "from" branch matches the current branch (that this command is being run against).

    To cover multiple CI scenarios ([see below](#ci)), either of:

    1.  The PR's [_test_ merge commit](https://developer.github.com/v3/pulls/#response-1) matches the current branch's `git` HEAD.
    2.  The PR and the current branch have the same `git` HEAD.

2.  The PR's base branch matches `master` (default) unless the [`githubPr.branch` configuration option](https://github.com/semantic-release/semantic-release#Release-config) is set.

## Configuration

It is assumed the user is already fully familiar with `semantic-release` and [`its workflow`](https://github.com/semantic-release/semantic-release#how-does-it-work).

### Github

Github authentication must be configured, exactly the same as for `semantic-relase`'s default [`@semantic-release/github`](https://github.com/semantic-release/github/#github-repository-authentication) plugin.

### Release config

It's possible to configure the expected base branch [when matching a PR](#which-prs-get-a-comment).

E.g., `package.json`:

```json
{
  "release": {
    "githubPr": {
      "branch": "staging"
    }
  }
}
```

#### Advanced

Due to limitations in how plugins may be composed, `semantic-release-github-pr` must unfortunately hard-code the [`analyzeCommits`](#analyzecommits) and [`generateNotes`](#generatenotes) [plugins](https://github.com/semantic-release/semantic-release/blob/caribou/docs/usage/plugins.md) (see discussion [here](https://github.com/semantic-release/semantic-release/issues/550)).

Users may still want to define a custom versions of these plugins, or want to pass options to the default implementations. To work around this problem, set the desired configuration in the [release plugin config](https://github.com/semantic-release/semantic-release#plugins) inside the `githubPr` key instead.

E.g., `package.json`:

```json
{
  "release": {
    "githubPr": {
      "analyzeCommits": "myCommitsAnalyzer",
      "generateNotes": "myGenerateNotes"
    }
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

### Advanced

Running `semantic-release-github-pr` is equivalent to running `semantic-release` with the following [configuration](https://github.com/semantic-release/semantic-release/blob/caribou/docs/usage/configuration.md#configuration.) (as encapsulated in [the `semantic-release-github-pr` command](https://github.com/Updater/semantic-release-github-pr/blob/master/bin/semantic-release-github-pr.js)):

```json
{
  "release": {
    "verifyConditions": "@semantic-release/github",
    "analyzeCommits": "semantic-release-github-pr",
    "generateNotes": "semantic-release-github-pr"
  }
}
```

### verifyConditions

The `@semantic-release/github` plugin is set as a default.

#### analyzeCommits

Used as a hook to clean up previous changelog PR comments made by the `generateNotes` plugin, keeping it from flooding a PR with (eventually stale) changelog comments over time.

If `semantic-release` determines that there's no new version, this plugin will also post a "no release" comment on a matching PR.

This plugin doesn't actually analyze commits to determine when to make a release, but defers to the plugin it decorates ([`@semantic-release/commit-analyzer`](https://github.com/semantic-release/commit-analyzer/) by default).

See the [`Release config`](#release-config) section for how to configure a custom `analyzeCommits` plugin and/or set options.

#### generateNotes

Creates a comment on matching PRs with the changelog for the release that would result from merging.

This plugin doesn't actually generate the changelog that ends up in the PR comment, but defers to the plugin it decorates ([`@semantic-release/release-notes-generator`](https://github.com/semantic-release/release-notes-generator) by default).

See the [`Release config`](#release-config) section for how to configure a custom `generateNotes` plugin and/or set options.
