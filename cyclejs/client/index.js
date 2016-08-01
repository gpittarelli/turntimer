import most from 'most';
import Cycle from '@cycle/most-run';
import {makeDOMDriver} from '@cycle/dom';
import isolate from '@cycle/isolate';
import {makeRouterDriver} from 'cyclic-router';
import {createHistory} from 'history';
import {makeHTTPDriver} from '@cycle/http';
import {fromPairs} from 'ramda';

import makeStateDriver from './stateDriver';
import Home from './home';
import Group from './group';

const drivers = {
  DOM: makeDOMDriver('#app-container'),
  router: makeRouterDriver(createHistory(), {capture: true}),
  HTTP: makeHTTPDriver(),
  player: makeStateDriver(),
};

function view({...sources, router}) {
  const page = router.define({
    '/group/:id/player/:name': (id, name) =>
       sources => Group({...sources, id, name}),
    '*': Home,
  }).map(({path, value}) =>
           isolate(value)({...sources, router: router.path(path)}))
    .multicast();

  return fromPairs(Object.keys(drivers).map(
    sink => [sink, page.map(c => c[sink] || most.never()).switch()]
  ));
}

Cycle.run(view, drivers);
