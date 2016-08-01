import most from 'most';
import {div, a, h1} from '@cycle/dom';
import mavi from './mavi';
import {toArray} from './helpers';

const intent = () => ({});

function model({player: player$, id}) {
  return {
    group$: most.of({id}),
    player$: player$,
  };
}

function view({group$, player$}) {
  return most.combine(toArray, group$, player$).map(([{id}, {name}]) => div([
    a({attrs: {href: '/'}}, 'Back home'),
    h1(`Welcome to group ${id}, ${name}!`),
  ]));
}

function act({player$, group$}) {
  return {
    HTTP: most.combine(toArray, group$, player$).map(([{id}, {name}]) => ({
      method: 'post',
      url: `/api/group/${id}/player/${name}`,
      category: 'join-group',
    })),
    player: most.never(),
  };
}

export default mavi(model, act, view, intent);
