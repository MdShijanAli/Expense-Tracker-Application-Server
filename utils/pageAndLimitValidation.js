/* const pageAndLimitValidation = (value) => {
  return Math.min(100, Math.max(1, parseInt(value)));
} */

const pageAndLimitValidation = (value) => {
  if (value === null || value === undefined) {
    throw new Error('Value cannot be null or undefined');
  }

  const parsed = parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    throw new Error('Value must be a valid number');
  }

  return Math.min(100, Math.max(1, parsed));
  }

module.exports = pageAndLimitValidation;