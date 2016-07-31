import most from 'most';
import {div, a, h1} from '@cycle/dom';
import mavi from './mavi';
import debug from 'debug';

const intent = () => ({});

function model({HTTP, id, name}) {
  HTTP.select('join-group').tap(debug('x'));
  return {
    group$: most.of({id, name}),
  };
}

function view({group$}) {
  return  group$.map(({id, name}) => div([
    a({attrs: {href: '/'}}, 'Back home'),
    h1(`Welcome to group ${id}, ${name}!`),
  ]));
}

function actions({group$}) {
  return {
    HTTP: group$.map(({id, name}) => ({
      method: 'get',
      uri: `/api/group/${id}/player/${name}`,
      category: 'join-group',
    })),
  };
}

export default mavi(model, actions, view, intent);
