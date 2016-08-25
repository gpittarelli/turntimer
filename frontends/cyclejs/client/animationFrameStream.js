import createStream from '@most/create';

export default function create() {
  return createStream(add => {
    function step(x) {
      add(x);
      window.requestAnimationFrame(step);
    }
    step(0);
  });
}
