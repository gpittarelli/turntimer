import xs from 'xstream';
import {run} from '@cycle/xstream-run';
import {div, a, h1, makeDOMDriver} from '@cycle/dom';
import {makeRouterDriver} from 'cyclic-router';
import {createHistory} from 'history';
import {makeHTTPDriver} from '@cycle/http';
import {fromPairs} from 'ramda';

import Home from './home';

function secondPage({id}) {
  return {
    DOM: xs.of(div([
      a({attrs: {href: '/'}}, 'Back home'),
      h1(`Other page, ${id}`),
    ])),
  };
}

function view({...sources, router}) {
  const match$ = router.define({
    '/group/:id': id => sources => secondPage({...sources, id}),
    '*': Home,
  }).map(({path, value}) => value({...sources, router: router.path(path)}));

  return fromPairs(['DOM', 'HTTP', 'router'].map(
    sink => [sink, match$.map(c => c[sink] || xs.never()).flatten()]
  ));
}

run(view, {
  DOM: makeDOMDriver('#app-container'),
  router: makeRouterDriver(createHistory(), {capture: true}),
  HTTP: makeHTTPDriver(),
});
