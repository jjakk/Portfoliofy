import React, { useState, useEffect/*, useRef*/ } from "react"
// import { AreaChart as PlotLineChart } from "@opd/g2plot-react";
import { Chart } from "react-google-charts";

const config = {
  height: 350,
  autoFit: true,
  xField: "date",
  yField: "close",
  smooth: true,
  meta: {
    value: {
      max: 15,
    },
  }
}

const defaultOptions = {
  hAxis: {
    title: "Year",
    textStyle: { color: "#FFF" }
  },
  vAxis: {
    textStyle: { color: "#FFF" },
  },
  legend: {
    textStyle: { color: "#FFF" },
  },
  chartArea: { width: "70%", height: "70%" },
  backgroundColor: { fill:'transparent' },
};

export default props => {
  const { data1, data2, name1, name2 } = props;
  // const chartRef = useRef();
  const [line1Data, setLine1Data] = useState([]);
  const [options, setOptions] = useState(null);

  useEffect(() => {
    if(data1?.length) {
      console.log(data1, data2);
      setLine1Data(
        data2?.length ? [
          ["Date", name1, name2],
          ...data1.map(({ date, close }, i) => [date, close, data2[i]?.close]),
        ] : [
          ["Date", "Price"],
          ...data1.map(({ date, close }) => [date, close]),
        ]
      );
      setOptions({
        ...defaultOptions,
        title: `${name1} vs ${name2}`,
        vAxis: {
          minValue: Math.min(...data1.map(({ close }) => close))
        }
      });
    }
  }, [data1, data2]);

  return (
    // <PlotLineChart
    //   {...config}
    //   data={data}
    //   chartRef={chartRef}
    // />
    <Chart
      chartType="AreaChart"
      data={line1Data}
      options={options}
      style={{ "height": "500px" }}
    />
  );
}