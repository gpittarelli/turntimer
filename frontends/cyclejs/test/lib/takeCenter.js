require('mocha-testcheck').install();
import {gen} from 'testcheck';
import assert from 'assert';
import {equals} from 'ramda';

import takeCenter from '../../lib/takeCenter';

const intAbove = min => gen.intWithin(min, Number.MAX_SAFE_INTEGER);

describe('takeCenter()', () => {
  check.it(
    'should return [] with n<=0',
    [gen.array(gen.int), gen.intWithin(-100, 0)],
    (arr, len) => {
      assert(equals(takeCenter(len, arr), []));
    });

  check.it(
    'should do nothing with n>=arr.length',
    [gen.bind(
      gen.array(gen.int),
      (arr) => gen.array([gen.return(arr), intAbove(arr.length)])
    )],
    ([arr, n]) => assert(equals(takeCenter(n, arr), arr)));

  check.it(
    'should return n elements',
    [gen.bind(
      gen.array(gen.int),
      (arr) => gen.array([gen.return(arr), gen.intWithin(0, arr.length)])
    )],
    ([arr, n]) => assert(equals(takeCenter(n, arr).length, n)));

  it('odd length test cases', () => {
    const base = [1, 2, 3, 4, 5],
      cases = [
        [1, [3]],
        [2, [2, 3]],
        [3, [2, 3, 4]],
        [4, [1, 2, 3, 4]],
        [5, base],
      ];

    cases.forEach(([n, expected]) => {
      assert.deepEqual(takeCenter(n, base), expected);
    });
  });

  it('even length test cases', () => {
    const base = [1, 2, 3, 4],
      cases = [
        [1, [2]],
        [2, [2, 3]],
        [3, [1, 2, 3]],
        [4, base],
      ];

    cases.forEach(([n, expected]) => {
      assert.deepEqual(takeCenter(n, base), expected);
    });
  });
});
