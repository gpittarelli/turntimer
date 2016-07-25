import 'localenv';
import 'babel-polyfill';

import express from 'express';

const server = express();

server.get('/', (req, res) => res.send('Hello World'));

const port = +process.env.PORT || 8080;
server.listen(port);
debug(`Listening on ${port}`);
