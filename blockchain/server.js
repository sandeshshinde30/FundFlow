import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

import Blockchain from './blockchain.js';

import contributeRoute from './routes/transaction.js';

import chainRoute from './routes/chain.js';
import nodesRoute from './routes/nodes.js';
import connectDB from './db.js';
import registerRoute from './routes/register.js';
import  login from './routes/login.js';
import sendTransaction from './routes/sendTransaction.js';
import dummySend from './routes/dummySend.js';
import creditWallet from './wallet/creditWallet.js';
import getBalance from './wallet/getBalance.js';
import getProfileInfo from './routes/getProfileInfo.js';
import transferFund from './routes/transferFund.js';
import sendFund from './routes/sendFund.js';
import getTransactions from './routes/getTransactions.js';
import createCampaign from './routes/createCampaign.js';
import getAllCompaigns from './routes/getAllCompaigns.js';
import getCampaigns from './routes/getCampaigns.js';
import getCampaignDetails from './routes/getCampaignDetails.js';
import updateCampaign from './routes/updateCampaign.js';
import deleteCampaign from './routes/deleteCampaign.js';
import withdrawFunds from './routes/withdrawFunds.js';
import searchCampaigns from './routes/searchCampaigns.js';
import getCampaignStats from './routes/getCampaignStats.js';
import getTransactionsByWallet from './routes/getTransactionsByWallet.js';
import getTransactionByHash from './routes/getTransactionByHash.js';
import getCampaignsInCurrentMonth from './routes/getCampaignsInCurrentMonth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

connectDB();

const nodeIdentifier = uuidv4().replace(/-/g, '');
const blockchain = new Blockchain();

app.use('/', contributeRoute(blockchain));
app.use('/chain', chainRoute(blockchain));
app.use('/nodes', nodesRoute(blockchain));
app.use('/register', registerRoute);
app.use('/login', login);
app.use('/sendTransaction', sendTransaction(blockchain));
app.use('/dummySend', dummySend);
app.use('/creditWallet', creditWallet);
app.use('/getBalance', getBalance);
app.use('/getProfileInfo', getProfileInfo);
app.use('/transferFund', transferFund);
app.use('/sendFund', sendFund(blockchain));
app.use('/getTransactions', getTransactions);
app.use('/getTransactionsByWallet', getTransactionsByWallet);
app.use('/getTransactionByHash', getTransactionByHash);
app.use('/createCampaign', createCampaign);
app.use('/getAllCompaigns', getAllCompaigns);
app.use('/getCampaigns', getCampaigns);
app.use('/getCampaignDetails', getCampaignDetails);
app.use('/updateCampaign', updateCampaign);
app.use('/deleteCampaign', deleteCampaign);
app.use('/withdrawFunds', withdrawFunds(blockchain));
app.use('/searchCampaigns', searchCampaigns);
app.use('/getCampaignStats', getCampaignStats);
app.use('/getCampaignsInCurrentMonth', getCampaignsInCurrentMonth);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Blockchain node running on port ${PORT}`);
});
