import { useEffect, useState } from "react";

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
    const startingValue = 10000;

    const [data1, setData1] = useState([]);
    const [name1, setName1] = useState([]);
    const [data2, setData2] = useState([]);
    const [name2, setName2] = useState([]);
    const [timeframe, setTimeframe] = useState(timeframeOptions[0]);
    const [ startDate, setStartDate ] = useState(null);

    useEffect(() => {
        if(data1.length && data2.length) {
            if(data1.length > data2.length) {
                const reformattedData1 = data1.filter(({ date }) => data2.find(({ date: date2 }) => date === date2));
                const startValue1 = reformattedData1[0].close;
                setData1(reformattedData1.map(data => ({ ...data, close: data.close * 10000 / startValue1 })));
                const startValue2 = data2[0].close;
                setData2(data2.map(data => ({ ...data, close: data.close * 10000 / startValue2 })));
            }
            if(data2.length > data1.length) {
                let reformattedData2 = data2.filter(({ date }) => data1.find(({ date: date2 }) => date === date2));
                const startValue = reformattedData2[0].close;
                reformattedData2 = reformattedData2.map(data => ({ ...data, close: data.close * 10000 / startValue }));
                setData2(reformattedData2);
                const startValue1 = data1[0].close;
                setData1(data1.map(data => ({ ...data, close: data.close * 10000 / startValue1 })));
            }
        }
    }, [data1, data2]);
    
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
                    setName={setName1}
                    startingValue={startingValue}
                    timeframe={timeframe}
                    startDate={startDate}
                />
                <DataSelect
                    setData={setData2}
                    setName={setName2}
                    startingValue={startingValue}
                    timeframe={timeframe}
                    startDate={startDate}
                />
                <LineChart
                    data1={data1}
                    name1={name1}
                    data2={data2}
                    name2={name2}
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