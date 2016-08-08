import 'localenv';
import 'babel-polyfill';
import express, {Router} from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import most from 'most';
import hold from '@most/hold';
import EventEmitter from 'events';
import toPromise from '../lib/toPromise';
import createDebug from 'debug';
const debug = createDebug('server');

const seconds = () => Math.round(Date.now() / 1000);

const tick$ = most.periodic(1000, '').map(seconds);

const groups = new Map();
function createGroup(id, turnTime=60) {
  const userEvents = new EventEmitter(),
    startTime = seconds(),
    users$ = hold(
      most.fromEvent('join', userEvents)
        .scan((acc, newUser) => {
          if (acc.filter(u => u.name === newUser.name).length > 0) {
            return acc;
          }
          return acc.concat(newUser)
        }, [])
    );
  users$.drain();

  return {
    join: u => userEvents.emit('join', u),
    data: most.combine(Array.of, tick$, users$).map(([now, users]) => {
      return {
        id,
        turnTime,
        timeLeft: 60 - ((now - startTime) % 60),
        users,
      };
    }),
  }
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

function wrap(routeFn) {
  return (req, res, next) => {
    routeFn(req, res, next).catch(next);
  }
}

groupRoutes.post('/', wrap(async ({params: {id}}, res) => {
  if (!groups.has(id)) {
    groups.set(id, createGroup(id));
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

groupRoutes.get('/player/:name', requireGroup, wrap( async({params: {id, name}}, res) => {
  const group = await getGroup(id),
    user = group.users.filter(u => u.name === name)[0];
  if (user) {
    res.send(user);
  } else {
    res.sendStatus(404);
  }
}));

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
