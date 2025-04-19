import express from 'express';

export default (blockchain) => {
  const router = express.Router();

  router.post('/register', (req, res) => {
    const { nodes } = req.body;
    if (!nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ error: 'Please supply a valid list of nodes' });
    }

    nodes.forEach((node) => blockchain.registerNode(node));
    res.status(201).json({
      message: 'New nodes have been added',
      total_nodes: Array.from(blockchain.nodes),
    });
  });

  router.get('/resolve', async (req, res) => {
    const replaced = await blockchain.resolveConflicts();

    if (replaced) {
      res.status(200).json({
        message: 'Our chain was replaced',
        new_chain: blockchain.chain,
      });
    } else {
      res.status(200).json({
        message: 'Our chain is authoritative',
        chain: blockchain.chain,
      });
    }
  });

  return router;
};
