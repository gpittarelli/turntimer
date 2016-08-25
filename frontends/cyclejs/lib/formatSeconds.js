export default function formatSeconds(seconds) {
  const sign = seconds < 0 ? '-' : '';
  seconds = Math.abs(seconds);

  return `${sign}${(seconds < 10 ? '0' : '') + seconds.toFixed(2)}`;
}
