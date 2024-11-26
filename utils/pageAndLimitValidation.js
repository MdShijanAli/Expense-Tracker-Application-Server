const pageAndLimitValidation = (value) => {
  return Math.min(100, Math.max(1, parseInt(value)));
}

module.exports = pageAndLimitValidation;