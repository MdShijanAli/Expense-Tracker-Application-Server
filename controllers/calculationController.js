const costModel = require('./../models/costModel')();

function calculationController() {

  // Get Costs By User Email
  const userDetails = async (req, res) => {
    const { user: userEmail, page = 1, limit = 20 } = req.query;

    if (!userEmail) {
      return res.status(400).json({ status: 'error', message: 'User Email ID is required' });
    }

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await costModel.getCostsByUserEmail(userEmail, pageNum, limitNum);

      console.log('Result: ', result);

    } catch (err) {
      console.error('Error getting Cost By User Email:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  return {
    userDetails
  }
}

module.exports = calculationController