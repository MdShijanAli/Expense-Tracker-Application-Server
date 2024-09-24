const fundsModel = require('../models/fundModel')();
const costModel = require('./../models/costModel')();

function calculationController() {

  // Get Costs By User Email
  const getUserDetails = async (req, res) => {
    const { user: userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({ status: 'error', message: 'User Email ID is required' });
    }

    try {
      // Fetch total expense and total income concurrently

      const totalExpense = await costModel.getUserTotalCostAmount(userEmail)
      const currentMonthExpense = await costModel.getAMonthUserTotalCostAmount(userEmail, true)
      const prevMonthMonthExpense = await costModel.getAMonthUserTotalCostAmount(userEmail, false)
      const totalIncome = await fundsModel.getUserTotalFundAmount(userEmail)
      const currentMonthFund = await fundsModel.getAMonthUserTotalFundAmount(userEmail, true)
      const prevMonthFund = await fundsModel.getAMonthUserTotalFundAmount(userEmail, false)
      const restFund = { money: totalIncome?.money - totalExpense?.money }


      // Log the results of each model call

      // Combine results into an array
      const result = { totalExpense, totalIncome, currentMonthExpense, prevMonthMonthExpense, currentMonthFund, prevMonthFund, restFund };

      // Log and send the response
      res.json({
        status: "Success",
        message: 'Executed Successfully',
        result: result
      })
    } catch (err) {
      console.error('Error getting Data By User Email:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  const getUserCustomYearDetails = async(req, res)=> {
    const { user: userEmail, year = 2024 } = req.query;

    if (!userEmail) {
      return res.status(400).json({ status: 'error', message: 'User Email ID is required' });
    }
    try {
      // Fetch total expense and total income concurrently

      const income = await fundsModel.getUserCurrentYearData(userEmail, year)
      const expense = await costModel.getUserCurrentYearData(userEmail, year)

      // Combine results into an array
      const result = { income, expense};

      // Log and send the response
      res.json({
        status: "Success",
        message: 'Executed Successfully',
        result: result
      })
    } catch (err) {
      console.error('Error getting Data By User Email:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  return {
    getUserDetails,
    getUserCustomYearDetails
  }
}

module.exports = calculationController