const costModel = require('./../models/costModel')();

function costController() {

  // Get All Funds
  const getAllCosts = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await costModel.getAllCosts(pageNum, limitNum);
      const total = result.total;
      const totalPages = Math.ceil(total / limitNum);

      const links = [
        {
          url: pageNum > 1 ? `${ process.env.API_URL }/api/costs?page=${ pageNum - 1 }` : null,
          label: "Previous",
          active: false
        },
        {
          url: `${ process.env.API_URL }/api/costs?page=1`,
          label: "1",
          active: pageNum === 1
        }
      ];

      for (let i = 2; i <= totalPages; i++) {
        links.push({
          url: `${ process.env.API_URL }/api/costs?page=${ i }`,
          label: `${ i }`,
          active: pageNum === i
        });
      }

      links.push({
        url: pageNum < totalPages ? `${ process.env.API_URL }/api/costs?page=${ pageNum + 1 }` : null,
        label: "Next",
        active: false
      });

      res.json({
        status: 'success',
        message: 'Executed Successfully',
        results: {
          total: result?.costs?.length,
          totalAmount: result?.costs?.map((fund) => fund.money)?.reduce((p, n) => p + n, 0),
          data: result?.costs,
          first_page_url: `${ process.env.API_URL }/api/costs?page=1`,
          last_page_url: `${ process.env.API_URL }/api/costs?page=${ totalPages }`,
          prev_page_url: pageNum !== 1 ? `${ process.env.API_URL }/api/costs?page=${ pageNum - 1 }` : null,
          links: links,
          next_page_url: pageNum < totalPages ? `${ process.env.API_URL }/api/costs?page=${ pageNum + 1 }` : null,
          current_page: pageNum,
          last_page: totalPages,
          totalPages: totalPages,
          per_page: limit
        }
      });
    } catch (err) {
      console.error('Error getting Costs:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Get FUnds By IID
  const getCostByID = async (req, res) => {
    const costID = req.params.id;

    if (!costID) {
      return res.status(400).json({ status: 'error', message: 'Cost ID is required' });
    }

    try {
      const result = await costModel.getCostByID(costID);
      if (result) {
        res.json({ status: 'success', message: 'Executed Successfully', result: result });
      } else {
        res.status(404).json({ status: 'not found', message: 'Cost not found' });
      }
    } catch (err) {
      console.error('Error getting Cost By ID:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Delete Cost By IID
  const deleteCostByID = async (req, res) => {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({ status: 'error', message: 'Cost ID is required' });
    }

    try {
      const result = await costModel.deleteCostByID(id);
      if (result) {
        res.json({ status: 'success', message: 'Executed Successfully' });
      } else {
        res.status(404).json({ status: 'not found', message: 'Cost not found' });
      }
    } catch (err) {
      console.error('Error deleting Cost By ID:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  return {
    getAllCosts,
    getCostByID,
    deleteCostByID
  }
}

module.exports = costController;