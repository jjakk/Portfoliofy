
const getStartDateFromTimeframe = timeframe => {
  let startDate = new Date();
    switch(timeframe) {
      case "1d":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "1w":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "1m":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "3m":
        startDate.setDate(startDate.getDate() - (30 * 3));
        break;
      case "6m":
        startDate.setDate(startDate.getDate() - (30 * 6));
        break;
      case "ytd":
        startDate = new Date(new Date().getFullYear(), 0, 1);
        break;
      case "1y":
        startDate.setDate(startDate.getDate() - (365));
        break;
      case "2y":
        startDate.setDate(startDate.getDate() - (365 * 2));
        break;
      case "5y":
        startDate.setDate(startDate.getDate() - (365 * 5));
        break;
      case "10y":
        startDate.setDate(startDate.getDate() - (365 * 10));
        break;
    }

    return startDate;
};

module.exports = {
  getStartDateFromTimeframe
};
