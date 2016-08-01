import most from 'most';
import {div, a, label, input, button} from '@cycle/dom';
import {prop, assoc, nthArg} from 'ramda';
import mavi from './mavi';
import {toArray, eventValue} from './helpers';

function intent({DOM}) {
  const name$ = DOM.select('.name').events('input').map(eventValue),
    groupId$ = DOM.select('.group-id').events('input').map(eventValue),
    joinGroup$ = DOM.select('.join-group').events('click');

  return {
    name$,
    groupId$,
    joinGroup$,
  };
}

function model({HTTP, player: player$, name$, groupId$, joinGroup$}) {
  return {
    joinButtonEnabled$: most.combine(toArray,
      name$.startWith(false),
      groupId$.startWith(false),
      joinGroup$.map(() => true).startWith(false)
    ).map(([name, groupId, click]) => !(name && groupId) || click),
    joinButtonClicked$: most.combine(toArray, name$, groupId$, joinGroup$),
    groupCreated$: HTTP.select('join-group').switch().map(prop('body')),
    name$,
    player$,
  };
}

function view({joinButtonEnabled$}) {
  return joinButtonEnabled$.map(enabled => div([
    label('Name:'), input('.name', {attrs: {type: 'text'}}),
    label('Group:'), input('.group-id', {attrs: {type: 'number'}}),
    button('.join-group', {attrs: {disabled: enabled}}, 'Join Group'),
    a({attrs: {href: '/group/123'}}, 'go'),
  ]));
}

function act({name$, player$, groupCreated$, joinButtonClicked$}) {
  return {
    HTTP: joinButtonClicked$.map(([,groupId]) => ({
      method: 'POST',
      url: `/api/group/${groupId}`,
      category: 'join-group',
    })),
    router: most.combine(nthArg(0), groupCreated$, player$)
      .map(({id}) => `/group/${id}`),
    player: most.combine(nthArg(0), name$, groupCreated$)
      .map(name => assoc('name', name)),
  };
}

export default mavi(model, act, view, intent);
