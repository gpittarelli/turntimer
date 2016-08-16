// rotate by x to the left
export const rotate = (x, arr) =>
  arr.slice(x, arr.length).concat(arr.slice(0, x));

export default function centerAround(x, arr) {
  // return the list arr (of length n), rotated such that the value
  // currently at index x is in the center (if n is even, x will end
  // up at the at the end of the first half of the array)
  const n = arr.length,
    m = Math.ceil(n/2) - 1;
  return rotate(x - m, arr);
}
