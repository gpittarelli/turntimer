import most from 'most';
import {div, a, h1, ul, li, button} from '@cycle/dom';
import {nthArg} from 'ramda';
import mavi from './mavi';
import {toArray} from './helpers';

const CHECK = '\u2713',
  ARROW = '\u21E8';

const intent = () => ({});

function model({player: player$, id, HTTP, DOM}) {
  const group$ = HTTP.select('update-group').switch().map(({body}) => body),
    playerName$ = player$.map(({name}) => name);

  return {
    groupId$: most.of({id}),
    group$,
    joinState$: HTTP.select('join-group').switch().map(({body}) => body),
    playerName$,
    player$: most.combine(Array.of, group$, playerName$)
      .map(([{users}, name]) => users.filter(u => u.name === name)[0]),
    toggleReady$: DOM.select('.ready').events('click'),
    endTurn$: DOM.select('.end-turn').events('click'),
  };
}

function view({group$, playerName$, joinState$}) {
  const joinStateUI$ = joinState$.map(
    () => []
  ).startWith([h1('Loading')]);

  const userList$ = group$.map(({users, activeTurn}) => ul(users.map(
    ({name, ready}, idx) => li([
      idx === activeTurn ? ARROW : '',
      name,
      ready ? CHECK : '',
    ])
  )));

  return most.combineArray(Array.of, [
    group$, userList$, playerName$,
    joinStateUI$, joinState$.startWith('Loading'),
  ]).map(([{...group, id}, userList, name, joinStateUI, joinState]) => div([
    a({attrs: {href: '/'}}, 'Back home'),
    ...joinStateUI,
    h1(`Welcome to group ${id}, ${name}!`),
    div(JSON.stringify(joinState)),
    div(group ? JSON.stringify(group) : 'none'),
    userList,
    button('.ready', 'Ready'),
    button('.end-turn', 'End Turn'),
  ]));
}

function act({playerName$, groupId$, toggleReady$, endTurn$, player$}) {
  const state$ = most.combine(toArray, groupId$, playerName$);

  return {
    HTTP: most.merge(
      most.combine(nthArg(0), groupId$, most.periodic(1000).startWith(0)).map(({id}) => ({
        method: 'get',
        url: `/api/group/${id}`,
        category: 'update-group',
      })),
      state$.map(([{id}, name]) => ({
        method: 'post',
        url: `/api/group/${id}/player/${name}`,
        category: 'join-group',
      })),
      toggleReady$.sample(toArray, state$, player$)
        .map(([[{id}, name], {ready}]) => ({
          method: 'patch',
          url: `/api/group/${id}/player/${name}/update`,
          send: {ready: !ready},
          category: 'update-player',
        })),
      endTurn$.sample(nthArg(0), state$)
        .map(([{id}, name]) => ({
          method: 'post',
          url: `/api/group/${id}/player/${name}/endTurn`,
          category: 'end-turn',
        }))
    ),
    player: most.never(),
  };
}

export default mavi(model, act, view, intent);
