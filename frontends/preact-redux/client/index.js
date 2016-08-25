import { Provider, connect } from 'preact-redux';
import { h, render } from 'preact';

const Main = () => (
  Provider({store, children: Child()})
);

const Child = connect(
    state => state
)( ({ text, setText }) => (
  h('input', {value: text, onInput: e => setText(e.target.value)})
));

render(() => h('h1', {}, 'Hi1'), document.getElementById('app-container'));
