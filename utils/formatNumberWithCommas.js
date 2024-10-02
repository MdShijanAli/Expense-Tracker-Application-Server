const formatNumbersWithCommas = (value) => {
  console.log('value', value);

  // Check if value is not a valid number
  if (!value || value === 0) {
    return '0.00'; // Return 0.00 for invalid input or 0
  }

  // Format the number with commas, but no currency symbol
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

module.exports = formatNumbersWithCommas;
