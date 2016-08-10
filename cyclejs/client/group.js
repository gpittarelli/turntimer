import most from 'most';
import {div, h1, ul, li, button, span} from '@cycle/dom';
import {StyleSheet, css} from 'aphrodite/no-important';
import {nthArg} from 'ramda';
import mavi from './mavi';
import {toArray} from './helpers';

const styles = StyleSheet.create({
  back: {
    textIndent: '-9999px',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    position: 'relative',
    width: 0,
    height: 0,
    padding: 0,
    border: 0,
    '::after': {
      display: 'block',
      content: '""',
      borderColor: 'black',
      backgroundColor: 'transparent',
      borderWidth: '0 0 5px 5px',
      borderStyle: 'solid',
      borderRadius: '1px',
      transform: 'rotateZ(45deg)',
      width: '0.4em',
      height: '0.4em',
      position: 'relative',
      top: (-1 + (1 - 0.4)/2) + 'em',
      left: '0.4em',
      cursor: 'pointer',
    },
  },
  active: {
    color: 'red',
  },
  ourTurn: {
    backgroundColor: 'green',
  },
  otherTurn: {
    backgroundColor: 'gray',
  },
});

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
    goBack$: DOM.select('.go-back').events('click'),
  };
}

const backButton = button(
  '.go-back',
  {class: {[css(styles.back)]: true}, attrs: {href: '/'}},
  'Back home'
);

function view({group$, playerName$, joinState$}) {
  const joinStateUI$ = joinState$.map(
    () => []
  ).startWith([h1('Loading')]);

  const userList$ = group$.combine(Array.of, playerName$)
    .map(([{users, activeTurn}, ourName]) => ul(users.map(
      ({name, ready}, idx) => li([
        idx === activeTurn ? ARROW : '',
        span({
          class: {
            [css(styles.active)]: name === ourName,
          },
        }, name),
        ready ? CHECK : '',
      ])
    )));

  const ourTurn$ = most.combine(Array.of, playerName$, group$).map(
    ([{activeTurn, users}, ourName]) =>
      users && (activeTurn === (users.findIndex(u => u.name === ourName)))
  );

  return most.combineArray(Array.of, [
    group$, userList$, joinStateUI$, ourTurn$,
  ]).map(([{timeLeft}, userList, joinStateUI, ourTurn]) => div({
    class: {
      [css(styles.ourTurn)]: ourTurn,
      [css(styles.otherTurn)]: !ourTurn,
    },
  }, [
    backButton,
    ...joinStateUI,
    div('.turn-time', timeLeft),
    userList,
    button('.end-turn', 'End Turn'),
  ]));
}

function act({playerName$, groupId$, toggleReady$, endTurn$, player$, goBack$}) {
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
    router: goBack$.constant('/'),
  };
}

export default mavi(model, act, view, intent);
