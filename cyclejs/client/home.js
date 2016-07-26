import xs from 'xstream';
import {div, a, label, input, button} from '@cycle/dom';
import {compose} from 'ramda';

export default compose(view, model, intent);

function view({joinButtonEnabled$}) {
  return {
    DOM: joinButtonEnabled$.map(enabled => div([
      label('Name:'), input('.name', {attrs: {type: 'text'}}),
      label('Group:'), input('.group-id', {attrs: {type: 'number'}}),
      button('.join-group', {attrs: {disabled: enabled}}, 'Join Group'),
      a({attrs: {href: '/group/123'}}, 'go'),
    ])),
  };
}

const eventValue = (ev) => ev.target.value;

function intent({DOM}) {
  const name$ = DOM.select('.name').events('input').map(eventValue),
    groupId$ = DOM.select('.group-id').events('input').map(eventValue),
    joinGroup$ = DOM.select('.join-group').events('click');

  return {
    name$,
    groupId$,
    joinGroup$,
/*    HTTP: xs.combine(name$, groupId$, joinGroup$).map(
      ([name, groupId, click]) => click && {
        method: 'POST',
        url: `/api/group/${groupId}?name=${name}`,
        category: 'join-group',
      }),
    router: sources.HTTP.select('join-group').flatten().map(
      ({body: {id}}) => `/group/${id}`
    ), */
  };
}

function model({...sources, name$, groupId$, joinGroup$}) {
  return {
    ...sources,
    joinButtonEnabled$: xs.combine(
      name$.startWith(false),
      groupId$.startWith(false),
      joinGroup$.map(() => true).startWith(false)
    ).map(([name, groupId, click]) => !(name && groupId) || click),
  };
}
