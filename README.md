# semantic-release-github-pr
[![Build Status](https://travis-ci.org/Updater/semantic-release-github-pr.svg?branch=master)](https://travis-ci.org/Updater/semantic-release-github-pr) [![npm](https://img.shields.io/npm/v/semantic-release-github-pr.svg)](https://www.npmjs.com/package/semantic-release-github-pr) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Preview the semantic release notes that would result from merging a Github PR.

![image](https://user-images.githubusercontent.com/356320/33625928-257bc906-d9c7-11e7-9adb-de85726952eb.png)

This set of [`semantic-release`](https://github.com/semantic-release/semantic-release) plugins will post a Github PR comment with a preview of the release that would result from merging.

## Install
```bash
npm install -D semantic-release-github-pr
```

## Usage
```bash
npx semantic-release-github-pr
```

It helps to think about `semantic-releaase-github-pr` as a variation on `semantic-release`'s default behavior, using the latter's plugin system to modify some behaviors:
 
* If a new release would result from running `semantic-release`, *instead of publishing a new release of a package to `npm`*, it posts a comment with the changelog to matching Github PRs.

* It posts a static message when there's no release (for clarity).

* At the beginning of each run, it cleans up any PR comments it previously made (to keep from flooding PRs or leaving outdated information).

### Options
See [`semantic-release` CLI](https://github.com/semantic-release/semantic-release#cli).

### Which PRs get a comment?
A PR gets a comment if:

 1. The PR's head branch matches the current branch (that the command ran against). 

 2. The PR's base branch is `branch` ([`--branch`](https://github.com/semantic-release/semantic-release#cli), one of `semantic-release`'s options, with `master` as default).

 3. To cover multiple CI scenarios ([see below](#ci)), either of:
    1. The PR's [*test* merge commit](https://developer.github.com/v3/pulls/#response-1) matches the current branch's `git` HEAD.
    2. The PR and the current branch have the same `git` HEAD.

## Configuration
It is assumed the user is already fully familiar with `semantic-release` and [`its workflow`](https://github.com/semantic-release/semantic-release#how-does-it-work).

### Github
Github authentication must be configured, exactly the same as for `semantic-relase`'s default [`@semantic-release/github`](https://github.com/semantic-release/github/#github-repository-authentication) plugin.

### Release config
Due to limitations in how plugins may be composed, `semantic-release-github-pr` must unfortunately hard-code the [`analyzeCommits` plugin](#analyzecommits) (see discussion [here](https://github.com/semantic-release/semantic-release/issues/550)). 

Users may still want to define a custom `analyzeCommits` plugin, or want to pass options to the default [`analyzeCommits` plugin](https://github.com/semantic-release/commit-analyzer/). To work around this problem, set the desired `analyzeCommits` configuration in the [release plugin config](https://github.com/semantic-release/semantic-release#plugins) inside the `githubPr` key instead.

E.g., `package.json`:
```json
{
  "release": {
    "githubPr": {
      "analyzeCommits": "myCommitsAnalyzer"
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
  - "[[ $TRAVIS_PULL_REQUEST != 'false' ]] && npx semantic-release-github-pr"
```

#### CircleCI
To run only when necessary, we use the [`$CI_PULL_REQUEST`](https://circleci.com/docs/1.0/environment-variables/#build-details) environment variable to detect whether the build has a corresponding pull request.

Unfortunately, CircleCI only supports building on push, [not when a PR is created](https://discuss.circleci.com/t/trigger-new-build-on-pr/4219). This limits the usefulness of the plugin somewhat, as a build will have to be triggered manually after a PR is opened for the changelog to post.

```yaml
test:README.md:21
  post:
    - "[[ $CI_PULL_REQUEST != '' ]] && npx semantic-release-github-pr"
```

### Advanced
Default configuration (as encapsulated in [the `semantic-release-github-pr` command](https://github.com/Updater/semantic-release-github-pr/blob/master/bin/semantic-release-github-pr.js)):
```json
{
  "release": {
    "analyzeCommits": "semantic-release-github-pr",
    "publish": "semantic-release-github-pr",
    "verifyConditions": ["@semantic-release/github", "semantic-release-github-pr"]
  }
}
```

#### verifyConditions
Used as a hook for cleaning up previous changelog PR comments made by the `publish` plugin, keeping it from flooding a PR with (eventually stale) changelog comments over time.

It's recommended to pair this package's `verifyConditions` with that of [`@semantic-release/github`](https://github.com/semantic-release/github#verifyconditions).

#### analyzeCommits
Used as a hook to create a "no release" comment on a matching PR, if `semantic-release` determines that there's no new version. Doesn't actually analyze commits itself, but decorates an `analyzeCommits` implementation ([`@semantic-release/commit-analyzer`](https://github.com/semantic-release/commit-analyzer/) by default).

See the [`Release config`](#release-config) section for how to configure a custom `analyzeCommits` plugin and/or set options.

#### publish
Creates a comment on matching PRs with the changelog for the release that would result from merging.
