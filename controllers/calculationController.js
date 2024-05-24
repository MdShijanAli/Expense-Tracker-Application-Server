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
      const restFund = { money: totalIncome.money - totalExpense.money }


      // Log the results of each model call
      console.log('Total Expense: ', totalExpense);
      console.log('Total Income: ', totalIncome);

      // Combine results into an array
      const result = { totalExpense, totalIncome, currentMonthExpense, prevMonthMonthExpense, currentMonthFund, prevMonthFund, restFund };

      // Log and send the response
      console.log('Result: ', result);
      res.json({
        status: "Success",
        message: 'Executed Successfully',
        result: result
      })
    } catch (err) {
      console.error('Error getting Cost By User Email:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  return {
    getUserDetails
  }
}

module.exports = calculationController