import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import ethers from 'ethers';
import api from './api.js';
import { port, coreAddress, delegateKey, hcaptchaToken } from './config.js';

const wallet = new ethers.Wallet(delegateKey);
const delegateAddress = wallet.address;

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1', cors(), api);

app.get('/', (req, res) => {
  res.render('index', { coreAddress, delegateAddress, hcaptchaToken });
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
