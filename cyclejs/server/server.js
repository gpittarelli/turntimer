import 'localenv';
import 'babel-polyfill';
import express, {Router} from 'express';
import morgan from 'morgan';
import most from 'most';
import hold from '@most/hold';
import toPromise from '../lib/toPromise';
import createDebug from 'debug';
const debug = createDebug('server');

const seconds = () => Math.round(Date.now() / 1000);

const tick$ = hold(most.periodic(1000, ''));

const groups = new Map();
function createGroup(id, turnTime=60) {
  let a = seconds();

  return hold(tick$.map(() => {
    return {
      id,
      turnTime,
      timeLeft: 60 - ((seconds() - a) % 60),
      users: [],
    };
  }));
}

async function getGroup(id) {
  if (groups.has(id)) {
    return await toPromise(groups.get(id).take(1));
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

function wrap(routeFn) {
  return (req, res, next) => {
    routeFn(req, res, next).catch(next);
  }
}

groupRoutes.post('/', ({params: {id}}, res) => {
  if (!groups.has(id)) {
    groups.set(id, createGroup(id));
  }
  res.send(groups.get(id));
});

groupRoutes.get('/', requireGroup, wrap(async ({params: {id}}, res) => {
  console.log('hi', getGroup(id));
  const group = await getGroup(id);
  res.send(group);
}));

groupRoutes.post('/player/:name', requireGroup, ({params: {id, name}}, res) => {
  const newUser = createUser(name);
  groups.get(id).users.push(newUser);
  res.send(newUser);
});

groupRoutes.get('/player/:name', requireGroup, ({params: {id, name}}, res) => {
  const user = groups.get(id).users.filter(u => u.name === name)[0];
  if (user) {
    res.send(user);
  } else {
    res.sendStatus(404);
  }
});

const apiRoutes = Router({mergeParams: true});
apiRoutes.get('/', (req, res) => res.send('API'));
apiRoutes.use('/group/:id', groupRoutes);

const server = express();
server.use(morgan('dev'));

server.get('/', (req, res) => res.send('Hello World'));
server.use('/api', apiRoutes);

const port = +process.env.PORT || 8080;
server.listen(port);
debug(`Listening on ${port}`);
