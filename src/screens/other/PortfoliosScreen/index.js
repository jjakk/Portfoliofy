import { useState } from "react";

import LineChart from "../../../charts/LineChart";
import Dropdown from "../../../components/Dropdown";
import GraphDataSelection from "./GraphDataSelection";

const PortfoliosScreen = () => {
    const [backtestingData, setBackTestingData] = useState([]);

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
                <Dropdown
                    label="Selection"
                    options={[{ label: "Stock", value: "stock" }, { label: "Portfolio", value: "porfolio" }]}
                    onSelection={console.log}
                />
                {/* <label htmlFor="ticker-symbol">Ticker Symbol</label>
                <input
                    name="ticker-symbol"
                    type="text"
                    className="input"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                /> */}
                <LineChart data={backtestingData} />
            </section>
        </div>
    );
};

export default PortfoliosScreen;