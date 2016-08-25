/* global console */
/* eslint-disable no-console */
const log = console.log.bind(console);

// Intended to be used as: stream.tap(debugStream('marker'))
export default name => (...args) => log(name, ...args);
