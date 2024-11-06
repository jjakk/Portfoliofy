import LineChart from "../../charts/LineChart";

const PortfoliosScreen = () => {
    return (
        <div>
            <h1 className="title">This is where your portfolios will show</h1>
            <LineChart data={[
                { year: "1991", value: 3 },
                { year: "1992", value: 4 },
                { year: "1993", value: 3.5 },
                { year: "1994", value: 5 },
                { year: "1995", value: 4.9 },
                { year: "1996", value: 6 },
                { year: "1997", value: 7 },
                { year: "1998", value: 9 },
                { year: "1999", value: 11 },
            ]} />
        </div>
    );
};

export default PortfoliosScreen;