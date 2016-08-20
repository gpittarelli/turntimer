require('mocha-testcheck').install();
import {gen} from 'testcheck';
import assert from 'assert';
import {equals} from 'ramda';

import tileMin from '../../lib/tileMin';
const intAbove = min => gen.intWithin(min, Number.MAX_SAFE_INTEGER);

describe('takeCenter()', () => {
  check.it(
    'should tile a single element array n times',
    [gen.int, gen.intWithin(1, 100)],
    (el, n) => {
      const result = tileMin(n, [el]);
      assert(equals(result.length, n), 'length should be max(n,l)');
      result.forEach(x => assert(equals(x, el)), 'el should be repeated');
    });

  check.it(
    'should return the same thing with n=arr.length',
    [gen.array(gen.int)],
    (arr) => {
      assert(equals(tileMin(arr.length, arr), arr));
    });

  it('test cases', () => {
    const cases = [
      [4, [1, 2, 3], [1, 2, 3, 1]],
      [5, [1, 2, 3], [3, 1, 2, 3, 1]],
      [6, [1, 2, 3], [3, 1, 2, 3, 1, 2]],
    ];

    cases.forEach(([n, input, expected]) => {
      assert.deepEqual(tileMin(n, input), expected);
    });
  });
});
