const formatNumbersWithCommas = require("./formatNumberWithCommas");

function formatResultData({ res, total = null, limitNum = null, pageNum = null, apiEndPoint = "", queryString = "", result = [], totalResults = null }) {
  const totalPages = Math.ceil(total / limitNum);
  const links = [
    {
      url: pageNum > 1 ? `${ process.env.API_URL }/api/${ apiEndPoint }?page=${ pageNum - 1 }&limit=${ limitNum }${ queryString ? '&' + queryString : '' }` : null,
      label: "Previous",
      active: false
    },
    {
      url: `${ process.env.API_URL }/api/${ apiEndPoint }?page=1&limit=${ limitNum }${ queryString ? '&' + queryString : '' }`,
      label: "1",
      active: pageNum === 1
    }
  ];

  for (let i = 2; i <= totalPages; i++) {
    links.push({
      url: `${ process.env.API_URL }/api/${ apiEndPoint }?page=${ i }&limit=${ limitNum }${ queryString ? '&' + queryString : '' }`,
      label: `${ i }`,
      active: pageNum === i
    });
  }

  links.push({
    url: pageNum < totalPages ? `${ process.env.API_URL }/api/${ apiEndPoint }?page=${ pageNum + 1 }&limit=${ limitNum }${ queryString ? '&' + queryString : '' }` : null,
    label: "Next",
    active: false
  });

  const formatResult = Array.isArray(result) ? result.map((item) => {
    try {
      if (Object.hasOwn(item, 'money')) {
        return {
          ...item,
          money: formatNumbersWithCommas(item.money)
        };
      }
      return item;
    } catch (error) {
      console.error('Error formatting money value:', error);
      return item;
    }
  }) : [];

  const totalAmount = Array.isArray(result)
    ? result.reduce((sum, item) => sum + (Number(item?.money) || 0), 0)
    : 0;

  res.json({
    status: 'success',
    message: 'Executed Successfully',
    results: {
      total: result?.length,
      totalResults: totalResults,
      totalAmount: formatNumbersWithCommas(totalAmount),
      data: formatResult,
      first_page_url: `${ process.env.API_URL }/api/${ apiEndPoint }?page=1&limit=${ limitNum }${ queryString ? '&' + queryString : '' }`,
      last_page_url: pageNum < totalPages ? `${ process.env.API_URL }/api/${ apiEndPoint }?page=${ totalPages }&limit=${ limitNum }${ queryString ? '&' + queryString : '' }` : null,
      prev_page_url: pageNum !== 1 ? `${ process.env.API_URL }/api/${ apiEndPoint }?page=${ pageNum - 1 }&limit=${ limitNum }${ queryString ? '&' + queryString : '' }` : null,
      links: links,
      next_page_url: pageNum < totalPages ? `${ process.env.API_URL }/api/${ apiEndPoint }?page=${ pageNum + 1 }&limit=${ limitNum }${ queryString ? '&' + queryString : '' }` : null,
      current_page: pageNum,
      last_page: totalPages,
      totalPages: totalPages,
      per_page: limitNum
    }
  });


}

module.exports = formatResultData;