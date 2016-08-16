require('mocha-testcheck').install();
import {gen} from 'testcheck';
import assert from 'assert';
import {equals} from 'ramda';

import centerAround, {rotate} from '../../lib/centerAround.js';

describe('rotate()', () => {
  check.it('should do nothing with x=0', [gen.array(gen.int)], arr => {
    assert(equals(rotate(0, arr), arr));
  });

  check.it(
    'should return the same elements',
    [gen.int, gen.array(gen.int)],
    (x, arr) => {
      const rotated = rotate(x, arr);
      assert(equals(rotated.sort(), arr.sort()));
      assert(rotated.length === arr.length);
    });

  it('should rotate odd length arrays right', () => {
    const arr1 = [1, 2, 3, 4, 5];
    assert.deepEqual(rotate(-1, arr1), [5, 1, 2, 3, 4]);
  });

  it('should rotate even length arrays right', () => {
    const arr1 = [1, 2, 3, 4];
    assert.deepEqual(rotate(-1, arr1), [4, 1, 2, 3]);
  });

  it('should rotate odd length arrays left', () => {
    const arr1 = [1, 2, 3, 4, 5];
    assert.deepEqual(rotate(1, arr1), [2, 3, 4, 5, 1]);
  });

  it('should rotate even length arrays left', () => {
    const arr1 = [1, 2, 3, 4];
    assert.deepEqual(rotate(1, arr1), [2, 3, 4, 1]);
  });
});

describe('centerAround()', () => {
  check.it(
    'should do nothing when centering around the middle',
    [gen.array(gen.int)],
    arr => {
      assert(equals(centerAround(Math.ceil(arr.length/2) - 1, arr), arr));
    });

  it('odd length test cases', () => {
    const base = [1, 2, 3, 4, 5],
      cases = [
        [0, [4, 5, 1, 2, 3]],
        [1, [5, 1, 2, 3, 4]],
        [2, [1, 2, 3, 4, 5]],
        [3, [2, 3, 4, 5, 1]],
        [4, [3, 4, 5, 1, 2]],
      ];

    cases.forEach(([idx, expected]) => {
      assert.deepEqual(centerAround(idx, base), expected);
    });
  });

  it('even length test cases', () => {
    const base = [1, 2, 3, 4],
      cases = [
        [0, [4, 1, 2, 3]],
        [1, base],
        [2, [2, 3, 4, 1]],
        [3, [3, 4, 1, 2]],
      ];

    cases.forEach(([idx, expected]) => {
      assert.deepEqual(centerAround(idx, base), expected);
    });
  });
});
