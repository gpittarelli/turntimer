import 'localenv';
import 'babel-polyfill';
import express, {Router} from 'express';
import bodyParser from 'body-parser';
import {merge, prop, inc} from 'ramda';
import morgan from 'morgan';
import most from 'most';
import hold from '@most/hold';
import EventEmitter from 'events';
import toPromise from '../lib/toPromise';
import createDebug from 'debug';
const debug = createDebug('server');

const seconds = () => Date.now() / 1000;
const tick$ = most.periodic(1000, '').map(seconds);

const groups = new Map();
function createGroup(id, turnTime=60) {
  const userEvents = new EventEmitter(),
    activeTurn$ = hold(most.fromEvent('endTurn', userEvents).scan(inc, 0)),
    timeLeft$ = hold(
      activeTurn$.map(() => {
        const turnStartTime = seconds();
        return tick$.map(x => Math.round(turnTime - (x - turnStartTime)));
      }).switch()
    ),
    users$ = hold(most.merge(
      most.fromEvent('join', userEvents)
        .map(newUser => users => {
          if (users.filter(u => u.name === newUser.name).length === 0) {
            return users.concat(newUser);
          }
          return users;
        }),
      most.fromEvent('update', userEvents)
        .map(([{name}, update]) => users => {
          const idx = Object.entries(users)
            .filter(([,{thisName}]) => thisName === name)[0][0];
          if (idx) {
            users[idx] = update(users[idx]);
          }
          return users;
        }),
    ).scan((users, update) => update(users), []));

  users$.drain().then(()=>1, err => console.error(err));
  activeTurn$.drain().then(()=>1, err => console.error(err));
  timeLeft$.drain().then(()=>1, err => console.error(err));

  return {
    join: u => userEvents.emit('join', u),
    update: (user, update) => userEvents.emit('update', user, update),
    endTurn: u => userEvents.emit('endTurn', u),
    data: most.combine(Array.of, users$, activeTurn$, timeLeft$)
      .map(([users, activeTurn, timeLeft]) => {
        const allReady = users.length > 0 && users.every(prop('ready'));
        return {
          id,
          activeTurn: activeTurn % users.length,
          state: allReady ? 'ready' : 'waiting',
          turnTime,
          timeLeft,
          users,
        };
      }),
  };
}

async function getGroup(id) {
  if (groups.has(id)) {
    return await toPromise(groups.get(id).data.take(1));
  }
}

function createUser(name) {
  return {name};
}

const groupRoutes = Router({mergeParams: true});

function requireGroup({params: {id}}, res, next) {
  if (groups.has(id)) {
    next();
  } else {
    res.sendStatus(404);
  }
}

const wrap = routeFn => (req, res, next) => routeFn(req, res, next).catch(next);

groupRoutes.post('/', wrap(async ({params: {id}, query: {turnTime}}, res) => {
  if (!groups.has(id)) {
    groups.set(id, createGroup(id, turnTime));
  }
  res.send(await getGroup(id));
}));

groupRoutes.get('/', requireGroup, wrap(async ({params: {id}}, res) => {
  res.send(await getGroup(id));
}));

groupRoutes.post('/player/:name', requireGroup, ({params: {id, name}}, res) => {
  const newUser = createUser(name);
  groups.get(id).join(newUser);
  res.send(newUser);
});

groupRoutes.get('/player/:name', requireGroup, wrap(findUser));
async function findUser({params: {id, name}}, res) {
  const group = await getGroup(id),
    user = group.users.filter(u => u.name === name)[0];
  if (user) {
    res.send(user);
  } else {
    res.sendStatus(404);
  }
}

groupRoutes.patch('/player/:name/update', requireGroup, updateUser);
function updateUser({...req, params: {id, name}, body}, res) {
  groups.get(id).update(name, u => merge(u, body));
  res.sendStatus(204);
}

groupRoutes.post('/player/:name/endTurn', requireGroup, endTurn);
function endTurn({...req, params: {id, name}, body}, res) {
  groups.get(id).endTurn(name);
  res.sendStatus(204);
}

const apiRoutes = Router({mergeParams: true});
apiRoutes.get('/', (req, res) => res.send('API'));
apiRoutes.use('/group/:id', groupRoutes);

const server = express();
server.use(morgan('dev'));
server.use(bodyParser.json());

server.get('/', (req, res) => res.send('Hello World'));
server.use('/api', apiRoutes);

const port = +process.env.PORT || 8080;
server.listen(port);
debug(`Listening on ${port}`);
