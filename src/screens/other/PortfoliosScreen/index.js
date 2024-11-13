import { useState, useEffect } from "react";

import LineChart from "../../../charts/LineChart";
import Dropdown from "../../../components/Dropdown";
import GraphDataSelection from "./GraphDataSelection";

import { getStockData, getPortfolioData } from "../../../axios/api";

const PortfoliosScreen = () => {
    const dataSourceOptions = [
        { label: "Ticker Symbol", value: "ticker" },
        { label: "Portfolio Name", value: "porfolio" }
    ];
    const timeframeOptions = [
        { label: "10 Years", value: "10y" },
        { label: "5 Years", value: "5y" },
        { label: "2 Years", value: "2y" },
        { label: "1 Year", value: "1y" },
        { label: "Year to Date", value: "ytd" },
        { label: "6 Months", value: "6m" },
        { label: "3 Months", value: "3m" },
        { label: "1 Month", value: "1m" },
        { label: "1 Week", value: "1w" },
        { label: "1 Day", value: "1d" },
    ];

    const [backtestingData, setBackTestingData] = useState([]);
    const [dataSource, setDataSource] = useState(dataSourceOptions[0]);
    const [timeframe, setTimeframe] = useState(timeframeOptions[0]);
    const [ticker, setTicker] = useState("");

    const updateData = () => {
        if(!ticker) {
            return;
        }

        switch(dataSource.value) {
            case "ticker":
                getStockData({ ticker, timeframe: timeframe.value }).then(({ historical }) => {
                    setBackTestingData(historical?.reverse());
                });
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
    }, [dataSource, ticker, timeframe]);

    return (
        <div>
            <section className="section">
                <h2 className="title">Create Portfolio</h2>
                <details>
                    <summary className="button">Expand/Collapse</summary>
                    <GraphDataSelection />
                </details>
            </section>
            <section className="section is-flex is-flex-direction-column gap-25">
                <h2 className="title m-0">Backtesting</h2>
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
                </div>
                <div className="is-flex is-align-items-center gap-15">
                    <label className="subtitle m-0">Timeframe</label>
                    <Dropdown
                        options={timeframeOptions}
                        onSelection={newValue => setTimeframe(newValue)}
                    />
                </div>
                <LineChart data={backtestingData} />
            </section>
        </div>
    );
};

export default PortfoliosScreen;