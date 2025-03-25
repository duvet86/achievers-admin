import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

interface Props {
  mentorsPerMonth: {
    x: string[];
    y: number[];
  };
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
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
