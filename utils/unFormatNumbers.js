const unFormatNumbers = (formattedValue) => {
  // Check if the input is a valid string
  if (!formattedValue || typeof formattedValue !== 'string') {
    return 0; // Return 0 for invalid input
  }

  // Remove commas from the formatted string and parse it back to a number
  const unformattedValue = parseFloat(formattedValue.replace(/,/g, ''));

  // Return the parsed number or 0 if parsing fails
  return isNaN(unformattedValue) ? 0 : unformattedValue;
};

module.exports = unFormatNumbers;
