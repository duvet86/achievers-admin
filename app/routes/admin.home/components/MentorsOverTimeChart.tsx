import type { ChartOptions } from "chart.js";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartDataLabels,
);

interface Props {
  mentorsPerMonth: {
    x: string[];
    y: number[];
  };
}

const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    datalabels: {
      align: "top",
    },
  },
};

export function MentorsOverTimeChart({ mentorsPerMonth }: Props) {
  const data = {
    labels: mentorsPerMonth.x,
    datasets: [
      {
        data: mentorsPerMonth.y,
        borderColor: "blue",
      },
    ],
    animation: {
      duration: 0,
    },
  };

  return <Line options={options} data={data} />;
}
