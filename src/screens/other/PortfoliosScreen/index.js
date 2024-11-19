import { useState } from "react";

import LineChart from "../../../charts/LineChart";
import Dropdown from "../../../components/Dropdown";
import CreatePortfolioForm from "./CreatePortfolioForm";
import DataSelect from "./DataSelect";

const PortfoliosScreen = () => {
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

    const [data1, setData1] = useState([]);
    const [data2, setData2] = useState([]);
    const [timeframe, setTimeframe] = useState(timeframeOptions[0]);

    return (
        <div>
            <section className="section">
                <h2 className="title">Create Portfolio</h2>
                <details>
                    <summary className="button">Expand/Collapse</summary>
                    <CreatePortfolioForm />
                </details>
            </section>
            <section className="section is-flex is-flex-direction-column gap-25">
                <h2 className="title m-0">Backtesting</h2>
                <DataSelect
                    setData={setData1}
                    timeframe={timeframe}
                />
                <DataSelect
                    setData={setData2}
                    timeframe={timeframe}
                />
                <LineChart
                    data1={data1}
                    data2={data2}
                />
                <div className="is-flex is-align-items-center gap-15">
                    <label className="subtitle m-0">Timeframe</label>
                    <Dropdown
                        options={timeframeOptions}
                        onSelection={newValue => setTimeframe(newValue)}
                    />
                </div>
            </section>
        </div>
    );
};

export default PortfoliosScreen;