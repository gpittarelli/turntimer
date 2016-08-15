import most from 'most';
import {div, h1, ul, li, button, span} from '@cycle/dom';
import {StyleSheet, css} from 'aphrodite/no-important';
import {nthArg, prop, subtract} from 'ramda';
import mavi from './mavi';
import {toArray} from './helpers';
import formatSeconds from '../lib/formatSeconds';

const buttonSideLen = 2.0;
const styles = StyleSheet.create({
  back: {
    textIndent: '-9999px',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    position: 'absolute',
    top: '2.5vw',
    left: '2.5vw',
    padding: 0,
    border: 0,
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
    cursor: 'pointer',
  },
  timer: {
    margin: '5% 0',
    fontSize: '14vmin',
    display: 'block',
    textAlign: 'center',
    fontFamily: 'DSEG7Classic,sans-serif',
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

const intent = () => ({});

function model({player: player$, id, HTTP, DOM, frames$}) {
  const group$ = HTTP.select('update-group').switch().map(({body}) => body),
    playerName$ = player$.map(({name}) => name),
    frameDelta$ = frames$.scan(({delta: prevDelta, absTime: prevAbsTime}, frameAbsTime) => ({
      delta: !prevAbsTime ? 0 : (frameAbsTime - prevAbsTime),
      absTime: frameAbsTime,
    }), {delta: 0}).map(prop('delta'));


  return {
    frameDelta$,
    groupId$: most.of({id}),
    group$,
    joinState$: HTTP.select('join-group').switch().map(({body}) => body),
    playerName$,
    player$: most.combine(Array.of, group$, playerName$)
      .map(([{users}, name]) => users.filter(u => u.name === name)[0]),
    toggleReady$: DOM.select('.ready').events('click'),
    endTurn$: DOM.select('.end-turn').events('click'),
    goBack$: DOM.select('.go-back').events('click'),
    timeLeft$: group$.map(({timeLeft}) => (
      frameDelta$.map(s=>s/1000).scan(subtract, timeLeft)
    )).switch(),
  };
}

const backButton = button(
  '.go-back',
  {class: {[css(styles.back)]: true}, attrs: {href: '/'}},
  'Back home'
);

function view({timeLeft$, group$, playerName$, joinState$}) {
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
    userList$, joinStateUI$, ourTurn$, timeLeft$,
  ]).map(([userList, joinStateUI, ourTurn, timeLeft]) => div({
    class: {
      [css(styles.ourTurn)]: ourTurn,
      [css(styles.otherTurn)]: !ourTurn,
    },
  }, [
    backButton,
    ...joinStateUI,
    div(
      '.turn-time',
      {class: {[css(styles.timer)]: true}},
      formatSeconds(timeLeft)
    ),
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
