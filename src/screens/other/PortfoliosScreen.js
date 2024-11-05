import { LineChart } from "../../nivo/charts/LineChart";

const PortfoliosScreen = () => {
    return (
        <div>
            <h1 className="title">This is where your portfolios will show</h1>
            <LineChart data={null} />
        </div>
    );
};

export default PortfoliosScreen;