import xs from 'xstream';
import {run} from '@cycle/xstream-run';
import {div, label, a, input, hr, h1, makeDOMDriver} from '@cycle/dom';
import {makeRouterDriver} from 'cyclic-router';
import {createHistory} from 'history';

function main(sources) {
  const match$ = sources.router.define({
    '/': mainPage,
    '/other': secondPage,
  });

  const page$ = match$.map(
    ({path, value}) =>
      value({...sources, router: sources.router.path(path)}));

  return { DOM: page$.map(c => c.DOM).flatten() };
}

function mainPage(sources) {
  return {
    DOM: sources.DOM.select('.field').events('input')
      .map(ev => ev.target.value)
      .startWith('')
      .map(name => div([
        label('Name:'),
        input('.field', {attrs: {type: 'text'}}),
        hr(),
        h1('Hello ' + name),
        a({attrs: {href: '/other'}}, 'hi this is a link'),
      ])),
  };
}

function secondPage() {
  return {
    DOM: xs.of(div([
      h1('Other page'),
      a({attrs: {href: '/'}}, 'Back home'),
    ])),
  };
}

run(main, {
  DOM: makeDOMDriver('#app-container'),
  router: makeRouterDriver(createHistory(), {capture: true}),
});
