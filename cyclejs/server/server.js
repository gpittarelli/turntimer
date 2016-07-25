import 'localenv';
import 'babel-polyfill';
import createDebug from 'debug';
const debug = createDebug('server');

import express from 'express';

const server = express();

server.get('/', (req, res) => res.send('Hello World'));

const port = +process.env.PORT || 8080;
server.listen(port);
debug(`Listening on ${port}`);
