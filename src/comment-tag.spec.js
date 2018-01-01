const { create, parse } = require('./comment-tag');

describe('#commentTag', () => {
  describe('#create', () => {
    it('returns a "markdown comment"', () => {
      const tag = create();

      // There isn't a built in concept of a markdown comment.
      // We interpret this format as a markdown comment: [//]: # (message)
      // https://stackoverflow.com/questions/4823468/comments-in-markdown/20885980#20885980
      expect(tag.substr(0, 9)).toBe('[//]: # (');
      expect(tag.substr(-1, 1)).toBe(')');
    });
  });

  describe('#parse', () => {
    const gitHead1 = 'b91c53fec559063afcacd75eb3b76dae8c683721';
    const gitHead2 = '6a26cf493e8ad954e27fb34e128b133d079a73c8';
    const packageName1 = 'semantic-release-github-pr';
    const packageName2 = 'semantic-release';
    const gitTag1 = 'v1.0.0';
    const gitTag2 = 'v1.0.1';

    describe('when passed a string containing a comment tag', () => {
      it('returns an object of matchers against each value', () => {
        const stringWithTag = create(gitHead1, packageName1, gitTag1);
        const result = parse(stringWithTag);

        expect(result.matchesGitHead(gitHead1)).toBe(true);
        expect(result.matchesGitHead(gitHead2)).toBe(false);

        expect(result.matchesPackageName(packageName1)).toBe(true);
        expect(result.matchesPackageName(packageName2)).toBe(false);

        expect(result.matchesGitTag(gitTag1)).toBe(true);
        expect(result.matchesGitTag(gitTag2)).toBe(false);
      });
    });

    describe('when passed anything but a string containing a comment tag', () => {
      it('returns null', () => {
        expect(parse(gitHead1)).toBe(null);
        expect(parse(null)).toBe(null);
        expect(parse(true)).toBe(null);
        expect(parse({})).toBe(null);
      });
    });
  });
});
