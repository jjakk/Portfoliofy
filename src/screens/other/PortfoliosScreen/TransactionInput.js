import { useState, useEffect } from "react";
import Dropdown from "../../../components/Dropdown";
import * as Api from "../../../axios/api";

export default props => {
    const { transaction, setTransaction } = props;

    const [transactionType, setTransactionType] = useState(transaction.transactionType);
    const [ticker, setTicker] = useState(transaction.ticker);
    const [date, setDate] = useState(transaction.date);
    const [priceAtDate, setPriceAtDate] = useState(transaction.priceAtDate);
    const [shares, setShares] = useState(transaction.shares);
    const [totalValue, setTotalValue] = useState(transaction.totalValue);

    useEffect(() => {
        console.log(ticker, date);
        if(ticker && date) {
            Api.getHistoricalStockPrice({ ticker, date })
            .then(({ closeValue }) => {
                setPriceAtDate(closeValue);
            });
        }
    }, [ticker, date]);

    useEffect(() => {
        setTotalValue((shares * priceAtDate).toFixed(2));
    }, [shares, priceAtDate]);

    useEffect(() => {
        setTransaction({
            ...transaction,
            transactionType,
            ticker,
            date,
            priceAtDate,
            shares,
            totalValue
        });
    }, [transactionType, ticker, date, priceAtDate, shares, totalValue]);

    return (
        <div className="is-flex gap-15">
            <Dropdown
                options={[
                    { label: "Buy", value: "buy" },
                    { label: "Sell", value: "sell" }
                ]}
                onSelection={({ value }) => setTransactionType(value)}
            />
            <input
                className="input"
                type="text"
                placeholder="ticker symbol"
                value={ticker}
                onChange={event => setTicker(event.target.value)}
            />
            <input
                className="input has-text-white"
                type="date"
                onChange={event => setDate(event.target.value)}
            />
            <input
                className="input"
                value={"$" + priceAtDate}
                disabled
            />
            <input
                className="input"
                placeholder="shares"
                value={shares}
                onChange={event => setShares(event.target.value)}
            />
            <input
                className="input"
                value={"$" + totalValue}
                disabled
            />
        </div>
    );
};