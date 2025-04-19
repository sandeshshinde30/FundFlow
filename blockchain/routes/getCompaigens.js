import express from 'express';

export default (blockchain) => {
  const router = express.Router();

  router.get('/campaign/:id/contributions', (req, res) => {
    const campaignId = req.params.id;

    let contributions = [];
    let totalRaised = 0;

    for (const block of blockchain.chain) {
      for (const tx of block.transactions) {
        if (tx.type === 'contribution' && tx.campaignId === campaignId) {
          contributions.push(tx);
          totalRaised += tx.amount;
        }
      }
    }

    res.json({
      campaignId,
      totalContributions: contributions.length,
      totalRaised,
      contributions
    });
  });

  return router;
};
