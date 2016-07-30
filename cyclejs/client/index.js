import most from 'most';
import Cycle from '@cycle/most-run';
import {div, a, h1, makeDOMDriver} from '@cycle/dom';
import isolate from '@cycle/isolate';
import {makeRouterDriver} from 'cyclic-router';
import {createHistory} from 'history';
import {makeHTTPDriver} from '@cycle/http';
import {fromPairs} from 'ramda';

import Home from './home';

function secondPage({id}) {
  return {
    DOM: most.of(div([
      a({attrs: {href: '/'}}, 'Back home'),
      h1(`Other page, ${id}`),
    ])),
  };
}

function view({...sources, router}) {
  const page = router.define({
    '/group/:id': id => sources => secondPage({...sources, id}),
    '*': Home,
  }).map(({path, value}) =>
           isolate(value)({...sources, router: router.path(path)}))
    .multicast();

  return fromPairs(['DOM', 'HTTP', 'router'].map(
    sink => [sink, page.map(c => c[sink] || most.never()).switch()]
  ));
}

Cycle.run(view, {
  DOM: makeDOMDriver('#app-container'),
  router: makeRouterDriver(createHistory(), {capture: true}),
  HTTP: makeHTTPDriver(),
});
