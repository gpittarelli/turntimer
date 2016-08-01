import 'localenv';
import 'babel-polyfill';
import express, {Router} from 'express';
import morgan from 'morgan';
import createDebug from 'debug';
const debug = createDebug('server');

const groups = {};
function createGroup(id, turnTime=60) {
  return {
    id,
    turnTime,
    users: [],
  };
}

const apiRoutes = Router();
apiRoutes.get('/', (req, res) => res.send('API'));

apiRoutes.post('/group/:id', ({query: {name}, params: {id}}, res) => {
  groups[id] = createGroup(id);
  res.send(groups[id]);
});

const server = express();
server.use(morgan('dev'));

server.get('/', (req, res) => res.send('Hello World'));
server.use('/api', apiRoutes);

const port = +process.env.PORT || 8080;
server.listen(port);
debug(`Listening on ${port}`);
