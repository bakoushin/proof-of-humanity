import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import ethers from 'ethers';
import api from './api.js';
import { port, jsonRPC, coreAddress } from './config.js';
import coreABI from './core-abi.js';

const provider = new ethers.providers.JsonRpcProvider(jsonRPC);
const coreContract = new ethers.Contract(coreAddress, coreABI, provider);
const coreOwner = await coreContract.owner();

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(morgan('dev'));

app.use('/api/v1', cors(), api);

app.get('/', (req, res) => {
  res.render('index', { coreAddress, coreOwner });
});

app.use((req, res) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.sendStatus(500);
});

const listener = app.listen(port, () => {
  console.log(`Listening on port ${listener.address().port}`);
});
