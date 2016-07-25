import xs from 'xstream';
import {run} from '@cycle/xstream-run';
import {div, h1, a, label, input, button, makeDOMDriver} from '@cycle/dom';
import {makeRouterDriver} from 'cyclic-router';
import {createHistory} from 'history';
import {makeHTTPDriver} from '@cycle/http';

function main(sources) {
  const match$ = sources.router.define({
    '/group/:id': id => sources => secondPage({...sources, id}),
    '*': mainPage,
  });

  const page$ = match$.map(
    ({path, value}) =>
      value({...sources, router: sources.router.path(path)}));

  return {
    DOM: page$.map(c => c.DOM).flatten(),
    HTTP: page$.map(c => c.HTTP || xs.never()).flatten(),
    router: page$.map(c => c.router || xs.never()).flatten(),
  };
}

function mainPage(sources) {
  const data = xs.combine(
    sources.DOM.select('.name').events('input')
      .map(ev => ev.target.value)
      .startWith(''),
    sources.DOM.select('.group-id').events('input')
      .map(ev => ev.target.value)
      .startWith(0),
    sources.DOM.select('.join-group').events('click').startWith(false)
  );

  return {
    DOM: data.map(([name, groupId, click]) => div([
      label('Name:'), input('.name', {attrs: {type: 'text'}}),
      label('Group:'), input('.group-id', {attrs: {type: 'number'}}),
      button('.join-group',
             {attrs: {disabled: !(name && groupId) || click}},
             'Join Group'),
      a({attrs: {href: '/group'}}, 'go'),
    ])),
    HTTP: data.map(([name, groupId, click]) => click && {
      method: 'POST',
      url: `/api/group/${groupId}?name=${name}`,
      category: 'join-group',
    }),
    router: sources.HTTP.select('join-group').flatten().map(
      ({body: {id}}) => `/group/${id}`
    ),
  };
}

function secondPage({id}) {
  return {
    DOM: xs.of(div([
      a({attrs: {href: '/'}}, 'Back home'),
      h1(`Other page, ${id}`),
    ])),
  };
}

run(main, {
  DOM: makeDOMDriver('#app-container'),
  router: makeRouterDriver(createHistory(), {capture: true}),
  HTTP: makeHTTPDriver(),
});
