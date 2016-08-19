import {clamp} from 'ramda';

// left-biased: if it's ever ambigous what the 'center' element/region
// is, the left-most of the two possible candidates is used
export default function takeCenter(n, arr) {
  n = clamp(0, arr.length, n);
  const i = Math.floor((arr.length - n)/2);
  return arr.slice(i, i + n);
}
