import { useState, useEffect } from "react";

import Dropdown from "../../../components/Dropdown";
import { getStockData, getPortfolioData } from "../../../axios/api";

export default props => {
    const { startingValue, setData, setName, timeframe } = props;

    const dataSourceOptions = [
        { label: "Ticker Symbol", value: "ticker" },
        { label: "Portfolio Name", value: "porfolio" }
    ];

    const [dataSource, setDataSource] = useState(dataSourceOptions[0]);
    const [ticker, setTicker] = useState("");

    const updateData = () => {
        if(!ticker) {
            return;
        }

        switch(dataSource.value) {
            case "ticker":
                getStockData({ ticker, timeframe: timeframe.value }).then(({ historical }) => {
                    if(historical?.length) {
                        historical.reverse();
                        const shares = startingValue / historical[0]?.close;
                        setData(historical?.map(({ close, ...rest }) => ({ ...rest, close: close * shares })));
                    }
                });
                setName(ticker);
                break;
            case "portfolio":
                getPortfolioData().then(data => {
                    console.log(data);
                });
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        updateData();
    }, [timeframe]);

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
            ) : dataSource.value === "porfolio" ? (
                <Dropdown
                    options={[
                        { label: "Portfolio 1", value: "portfolio1" },
                        { label: "Portfolio 2", value: "portfolio2" }
                    ]}
                    onSelection={({ value }) => updateData({ dataSource: "portfolio", value })}
                />
            ) : null}
            <button className="button" onClick={updateData}>Select</button>
        </div>
    );
};