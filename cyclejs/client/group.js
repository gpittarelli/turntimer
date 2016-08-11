import most from 'most';
import {div, h1, ul, li, button, span} from '@cycle/dom';
import {StyleSheet, css} from 'aphrodite/no-important';
import {nthArg} from 'ramda';
import mavi from './mavi';
import {toArray} from './helpers';

const buttonSideLen = 1.0;
const styles = StyleSheet.create({
  back: {
    textIndent: '-9999px',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    position: 'absolute',
    top: '2vw',
    left: '2vw',
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
      width: `${buttonSideLen}em`,
      height: `${buttonSideLen}em`,
      position: 'relative',
      top: (-1 + (1 - buttonSideLen)/2) + 'em',
      cursor: 'pointer',
    },
  },
  timer: {
    margin: '10%',
    fontSize: '25vw',
    display: 'block',
    textAlign: 'center',
  },
  userList: {
    textAlign: 'center',
  },
  endTurn: {
    margin: '2em auto 0',
    width: '75%',
    display: 'block',
    height: '5%',
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
    .map(([{users, activeTurn}, ourName]) => ul({
      class: {[css(styles.userList)]: true},
    }, users.map(
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

  const ourTurn$ = most.combine(Array.of, group$, playerName$).map(
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
    div('.turn-time', {class: {[css(styles.timer)]: true}}, timeLeft),
    userList,
    button('.end-turn', {class: {[css(styles.endTurn)]: true}}, 'End Turn'),
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
