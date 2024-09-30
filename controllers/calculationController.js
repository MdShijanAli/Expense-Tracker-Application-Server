const fundsModel = require('../models/fundModel')();
const costModel = require('../models/costModel')();

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


      if (totalExpense && currentMonthExpense && prevMonthMonthExpense && totalIncome && currentMonthFund && prevMonthFund) {

        const restFund = { money: totalIncome?.money - totalExpense?.money}
        console.log('Rest FUnd', restFund);
        

        // Combine results into an array
        const result = { totalExpense, totalIncome, currentMonthExpense, prevMonthMonthExpense, currentMonthFund, prevMonthFund, restFund };

        // Log and send the response
        res.json({
          status: "Success",
          message: 'Executed Successfully',
          result: result
        })
      }
    } catch (err) {
      console.error('Error getting Data By User Email:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  const getUserCustomYearDetails = async (req, res) => {
    const { user: userEmail, year = 2024 } = req.query;

    if (!userEmail) {
      return res.status(400).json({ status: 'error', message: 'User Email ID is required' });
    }
    try {
      const income = await fundsModel.getUserCurrentYearData(userEmail, year)
      const expense = await costModel.getUserCurrentYearData(userEmail, year)

      console.log('Income', income);
      

      const totalIncome = income?.total;
      const totalExpense = expense?.total;

      const total = totalIncome + totalExpense;

      const incomePercentage = Math.round(totalIncome / total * 100);
      const expensePercentage = Math.round(totalExpense / total * 100);


      // Combine results into an array
      if (income && expense) {
        const result = { income, expense, incomePercentage, expensePercentage };
        // Log and send the response
        res.json({
          status: "Success",
          message: 'Executed Successfully',
          result: result
        })
      }
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