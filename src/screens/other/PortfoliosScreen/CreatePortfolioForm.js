import { useEffect, useState } from "react";
import * as Api from "../../../axios/api";
import TransactionInput from "./TransactionInput";

export default () => {
    const transactionTemplate = {
        transactionType: "buy",
        ticker: null,
        date: null,
        priceAtDate: "",
        shares: 0,
        totalValue: 0
    };
    const startingCapital = 10000;
    const [name, setName] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [remainingBalance, setRemainingBalance] = useState(startingCapital);

    const addTransaction = () =>  setTransactions([...transactions, { ...transactionTemplate }]);
    const createPortfolio = async () => {
        await Api.postPortfolio({
            name,
            balance: remainingBalance,
            transactions: transactions
                .map(({
                    transactionType,
                    ticker,
                    date,
                    priceAtDate,
                    shares,
                    totalValue
                }) => ({
                    total_amount: totalValue,
                    quantity: transactionType === "buy" ? shares : -1 * shares,
                    price_per_share: priceAtDate,
                    transaction_date: date,
                    stocks_ticker_symbol: ticker,
                }))
        });
    };

    useEffect(() => {
        let capital = startingCapital;
        for(const transaction of transactions) {
            capital -= transaction.transactionType === "buy"
                ? transaction.totalValue
                : -1 * transaction.totalValue
        }
        setRemainingBalance(capital.toFixed(2));
    }, [transactions]);

    return (
        <div className="is-flex is-flex-direction-column is-align-items-flex-start gap-15 pt-3">
            <h2 className="subtitle m-0">Portfolio Name</h2>
            <input className="input" type="text" value={name} onChange={event => setName(event.target.value)} />
            {transactions.map((transaction, index) => (
                <TransactionInput
                    key={index}
                    transaction={transaction}
                    setTransaction={
                        updatedTransaction =>
                            setTransactions(
                                transactions.map((t, i) => index === i ? updatedTransaction : t)
                            )
                    }
                />
            ))}
            <p>
                Remaining Balance: $<span>{ remainingBalance }</span>
            </p>
            <div className="is-flex gap-15">
                <button className="button" onClick={addTransaction}>Add</button>
                <button className="button" onClick={createPortfolio}>Create</button>
            </div>
        </div>
    );
};