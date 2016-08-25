import mostAdapter from '@cycle/most-adapter';
import hold from '@most/hold';

const stateDriver = (initialState = {}) => input$ =>
  hold(input$.scan((state, update) => update(state), initialState));

stateDriver.streamAdapter = mostAdapter;

export default stateDriver;
