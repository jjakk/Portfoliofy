import { useState } from "react";

export default () => {
    const stockTemplate = { ticker: "", sizePct: 0 };
    const [stocks, setStocks] = useState([]);

    const updateStockTicker = (ticker, index) =>  setStocks(stocks.map((s, i) => i === index ? { ...s, ticker } : s));
    const updateStockSize = (sizePct, index) => setStocks(stocks.map((s, i) => i === index ? { ...s, sizePct } : s));
    const onAddStock = () =>  setStocks([...stocks, { ...stockTemplate }]);
    const onRemoveStock = (index) =>  setStocks(stocks.filter((_, i) => i !== index));

    return (
        <div className="is-flex is-flex-direction-column is-align-items-flex-start gap-15 pt-3">
            <h2 className="subtitle m-0">Portfolio Name</h2>
            <input className="input" type="text" />
            {stocks.map((stock, index) => (
                <div key={index} className="is-flex gap-15">
                    <input
                        className="input"
                        type="text"
                        value={stock.ticker}
                        onChange={event => updateStockTicker(event.target.value, index)}
                    />
                    <input
                        className="input"
                        type="number"
                        value={stock.sizePct}
                        onChange={event => updateStockSize(event.target.value, index)}
                    />
                    <button className="button" onClick={() => onRemoveStock(index)}>Delete</button>
                </div>
            ))}
            <p>
                Remaining Balance: $<span></span>
            </p>
            <div className="is-flex gap-15">
                <button className="button" onClick={onAddStock}>Add</button>
                <button className="button">Create</button>
            </div>
        </div>
    );
};