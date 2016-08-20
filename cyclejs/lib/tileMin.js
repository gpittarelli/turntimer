import {reverse, take, unnest, repeat, curry} from 'ramda';

// take n $ cycle arr
const takeCycle = (n, arr) => {
  const l = arr.length;
  return unnest(repeat(arr, Math.floor(n / l))).concat(take(n % l, arr));
};

export default curry(function tileMin(n, arr) {
  const l = arr.length;

  if (l === 0) {
    return [];
  }

  if (n <= l) {
    return arr;
  }

  const addLeft = Math.floor((n - l) / 2),
    addRight = addLeft + ((n - l) % 2);
  return [].concat(
    takeCycle(addLeft, reverse(arr)),
    arr,
    takeCycle(addRight, arr)
  );
});
