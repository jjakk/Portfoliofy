import React, { useRef } from "react"
import { AreaChart as PlotLineChart } from "@opd/g2plot-react";

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

export default props => {
  const { data } = props;
  const chartRef = useRef();
  return (
    <PlotLineChart
      {...config}
      data={data}
      chartRef={chartRef}
    />
  );
}