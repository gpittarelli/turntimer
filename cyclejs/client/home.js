import most from 'most';
import {form, div, label, input, button} from '@cycle/dom';
import {prop, assoc, nthArg} from 'ramda';
import mavi from './mavi';
import {toArray, eventValue} from './helpers';
import {StyleSheet, css} from 'aphrodite/no-important';

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'gray',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '5%',
  },
  formRow: {
    margin: '10% 0 0',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  label: {
    paddingRight: '10px',
    fontSize: '20px',
  },
  input: {
    flex: 1,
    minWidth: '50px',
    border: 0,
    borderBottom: '2px black solid',
    background: 'transparent',
    fontSize: '20px',
  },
  numberInput: {
    width: '5em',
    flex: 'inherit',
  },
  joinButton: {
    marginTop: '10%',
    padding: '2em',
    width: '50%',
  },
});

function intent({DOM}) {
  const name$ = DOM.select('.name').events('input').map(eventValue),
    groupId$ = DOM.select('.group-id').events('input').map(eventValue),
    turnTime$ = DOM.select('.turn-time').events('input').map(eventValue).startWith(60),
    joinGroup$ = DOM.select('.join-group').events('click'),
    createGroup$ = DOM.select('.create-group').events('click');

  return {
    name$,
    groupId$,
    joinGroup$,
    turnTime$,
    createGroup$,
  };
}

function model({
  HTTP, player: player$, name$, turnTime$,
  groupId$, joinGroup$, createGroup$,
}) {
  const buttonClick$ = most.merge(joinGroup$, createGroup$);

  return {
    joinButtonEnabled$: most.combine(
      toArray,
      name$.startWith(false),
      groupId$.startWith(false),
      buttonClick$.map(() => true).startWith(false)
    ).map(([name, groupId, click]) => !(name && groupId) || click),
    createGroup$: most.combine(toArray, name$, groupId$, turnTime$, buttonClick$),
    groupCreated$: HTTP.select('join-group').switch().map(prop('body')),
    name$,
    player$,
  };
}

function view({joinButtonEnabled$}) {
  return joinButtonEnabled$.map(enabled => form({
    class: {[css(styles.page)]: true},
  }, [
    div({class: {[css(styles.formRow)]: true}}, [
      label({class:{[css(styles.label)]: true}}, 'Name:'),
      input('.name', {
        attrs: {required: true, type: 'text'},
        class: {[css(styles.input)]: true},
      }),
    ]),
    div({class: {[css(styles.formRow)]: true}}, [
      label({class:{[css(styles.label)]: true}}, 'Group:'),
      input('.group-id', {
        attrs: {required: true, type: 'number'},
        class: {
          [css(styles.input)]: true,
          [css(styles.numberInput)]: true,
        },
      }),
    ]),
    button('.join-group', {
      attrs: {disabled: enabled},
      class: {[css(styles.joinButton)]: true},
    }, 'Join Group'),
    div({class: {[css(styles.formRow)]: true}}, [
      label({class:{[css(styles.label)]: true}}, 'Turn Time:'),
      input('.turn-time', {
        attrs: {required: true, type: 'number', min: 0, value: 60},
        class: {
          [css(styles.input)]: true,
          [css(styles.numberInput)]: true,
        },
      }),
    ]),
    button('.create-group', {
      attrs: {disabled: enabled},
      class: {[css(styles.joinButton)]: true},
    }, 'Create Group'),
  ]));
}

function act({name$, player$, groupCreated$, createGroup$}) {
  return {
    HTTP: createGroup$.map(([, groupId, turnTime]) => ({
      method: 'POST',
      url: `/api/group/${groupId}`,
      query: {turnTime},
      category: 'join-group',
    })),
    router: most.combine(nthArg(0), groupCreated$, player$)
      .map(({id}) => `/group/${id}`),
    player: most.combine(nthArg(0), name$, groupCreated$)
      .map(name => assoc('name', name)),
  };
}

export default mavi(model, act, view, intent);
