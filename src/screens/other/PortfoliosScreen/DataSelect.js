import { useState, useEffect } from "react";

import Dropdown from "../../../components/Dropdown";
import * as Api from "../../../axios/api";

export default props => {
    const { startingDate, startingValue, setData, setName, timeframe } = props;
    const [portfolioOptions, setPortfolioOptions] = useState(null);

    const dataSourceOptions = [
        { label: "Ticker Symbol", value: "ticker" },
        { label: "Portfolio Name", value: "portfolio" }
    ];

    const [dataSource, setDataSource] = useState(dataSourceOptions[0]);
    const [ticker, setTicker] = useState("");
    const [portfolio, setPortfolio] = useState({});

    const addDays = (date, days) => {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + days);
        return newDate;
    }
    const updateData = () => {
        switch(dataSource.value) {
            case "ticker":
                if(!ticker) {
                    return;
                }
                Api.getStockData({ ticker, timeframe: timeframe.value }).then(({ historical }) => {
                    if(historical?.length) {
                        historical.reverse();
                        const shares = startingValue / historical[0]?.close;
                        setData(historical?.map(({ close, ...rest }) => ({ ...rest, close: close * shares })));
                    }
                });
                setName(ticker);
                break;
            case "portfolio":
                Api.getPortfolioData({ id: portfolio.id }).then(portfolioResponse => {
                    const { stocks } = portfolioResponse;
                    let earliestDate = new Date();
                    for(const stock of stocks) {
                        const { historical } = stock;
                        for(const [date, value] of Object.entries(historical)) {
                            if(new Date(date) < earliestDate) {
                                earliestDate = new Date(date);
                            }
                        }
                    }
                    const values = [];
                    let date = earliestDate;
                    while(date < new Date()){
                        let totalValueAtDay = 0;
                        let skip = false;
                        for(const stock of stocks) {
                            const valueAtDay = stock.historical[date.toISOString().split('T')[0]];
                            if(valueAtDay) {
                                totalValueAtDay += (valueAtDay * stock.quantity);
                            }
                            else {
                                skip = true;
                            }
                        }
                        if(!skip) {
                            totalValueAtDay += portfolioResponse.balance;
                            values.push({ date: date.toISOString().split('T')[0], close: totalValueAtDay});
                        }
                        date = addDays(date, 1);
                    }
                    setData(values);
                });
                setName(portfolio.name);
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        updateData();
    }, [timeframe, startingDate]);

    useEffect(() => {
        Api.getPortfolios().then(portfolios => {
            const options = portfolios.map(({ name, portfolio_id }) => ({ label: name, value: portfolio_id }));
            setPortfolio({ name: options[0]?.label, id: options[0]?.value });
            setPortfolioOptions(options);
        });
    }, []);

    return (
        <div className="is-flex is-align-items-center gap-15">
            <label className="subtitle m-0">Select by</label>
            <Dropdown
                options={dataSourceOptions}
                onSelection={newValue => setDataSource(newValue)}
            />
            {dataSource.value === "ticker" ? (
                <input
                    className="input"
                    type="text"
                    value={ticker}
                    onChange={event => setTicker(event.target.value)}
                />
            ) : dataSource.value === "portfolio" ? (
                <Dropdown
                    options={portfolioOptions}
                    onSelection={({ label, value }) => setPortfolio({ name: label, id: value })}
                />
            ) : null}
            <button className="button" onClick={updateData}>Select</button>
        </div>
    );
};
function balanceStockInput(valueObject, changedKey) {
    let {QUANTITY, TOTAL_AMOUNT, percentOfPortfolio, PRICE_PER_SHARE, BALANCE} = valueObject;
    switch(changedKey)
    {
      case "TOTAL_AMOUNT":
        QUANTITY = TOTAL_AMOUNT/PRICE_PER_SHARE;
        percentOfPortfolio = TOTAL_AMOUNT/BALANCE;
        break;
      case "percentOfPortfolio":
        TOTAL_AMOUNT = percentOfPortfolio*BALANCE;
        QUANTITY = TOTAL_AMOUNT/PRICE_PER_SHARE;
        break;
      case "PRICE_PER_SHARE" || "QUANTITY":
        TOTAL_AMOUNT = QUANTITY*PRICE_PER_SHARE;
        percentOfPortfolio = TOTAL_AMOUNT/BALANCE;
        break;
      case "BALANCE":
        percentOfPortfolio = TOTAL_AMOUNT/BALANCE;
        break;
    }
    return {QUANTITY, TOTAL_AMOUNT, percentOfPortfolio, PRICE_PER_SHARE, BALANCE}; 
  }