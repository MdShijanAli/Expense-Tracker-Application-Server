const express = require('express');
const CategoryController = require('../controllers/categoryController');
const fundsController = require('../controllers/fundsController')();
const calculationController = require('../controllers/calculationController')();
const costController = require('../controllers/costController')();

const router = express.Router();

// Categories
router.post('/api/categories', CategoryController.createCategory);
router.get('/api/categories', CategoryController.getAllCategories);
router.get('/api/categories/:id', CategoryController.getCategoryByID);
router.delete('/api/categories/:id', CategoryController.deleteCategoryByID);

// Funds
router.post('/api/funds', fundsController.createFund);
router.put('/api/funds/update/:id', fundsController.updateFundByID);
router.get('/api/funds', fundsController.getAllFunds);
router.get('/api/funds/details/:id', fundsController.getFundByID);
router.get('/api/funds/user-funds', fundsController.getFundsByUserEmail);
router.get('/api/funds/fund-category', fundsController.getFundsByCategory);
router.get('/api/funds/date-funds', fundsController.getFundsByDate);
router.get('/api/funds/user-fund-category', fundsController.getFundsByCategoryAndUser);
router.get('/api/funds/user-all-fund-category/lists', fundsController.getFundCategoryWithValue);
router.get('/api/funds/user-year-fund', fundsController.getAYearTotalFunds);
router.get('/api/funds/:email/:year', fundsController.getUserYearDataController);
router.delete('/api/funds/delete', fundsController.deleteFundByID);
router.delete('/api/funds/delete-user-category', fundsController.deleteFundsCategoryByUser);

// Costs
router.post('/api/costs', costController.createCost);
router.put('/api/costs/update/:id', costController.updateCostByID);
router.get('/api/costs', costController.getAllCosts);
router.get('/api/costs/details/:id', costController.getCostByID);
router.get('/api/costs/user-costs', costController.getCostsByUserEmail);
router.get('/api/costs/date-costs', costController.getCostsByDate);
router.get('/api/costs/cost-category', costController.getCostsByCategory);
router.get('/api/costs/user-cost-category', costController.getCostsByCategoryByUser);
router.get('/api/costs/user-all-cost-category/lists', costController.getCostCategoryWithValue);
router.get('/api/costs/:email/:year', costController.getUserYearDataController);
router.delete('/api/costs/delete', costController.deleteCostByID);
router.delete('/api/costs/delete-user-category', costController.deleteCostCategoryByUser);

// User Details
router.get('/api/user-details', calculationController.getUserDetails);
router.get('/api/user-details-year', calculationController.getUserCustomYearDetails);


module.exports = router;
