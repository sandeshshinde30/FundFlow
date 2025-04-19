import express from 'express';

export default (blockchain) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.status(200).json({
      chain: blockchain.chain,
      length: blockchain.chain.length,
    });
  });

  return router;
};
