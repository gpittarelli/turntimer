// MAVI = Model, Actions+View, and Intent
//
// a slight modificaiton to cyclejs's typical MVI style to also
// naturally support intents leading directly to actions--to aide my
// opinion that components should be in charge of enacting their
// actions. Eg: a form component, in response to a submit button,
// should directly emit a value for the HTTP driver.
export default function mavi(model, act, view, intent) {
  const viewAndAct = sources => {
    const actions = act(sources);
    return {DOM: view(sources), ...actions};
  };

  return sources => {
    const intentions = intent(sources);
    return viewAndAct(model({...sources, ...intentions}));
  };
}
