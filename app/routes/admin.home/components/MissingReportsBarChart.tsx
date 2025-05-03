import type { ChartData, ChartOptions } from "chart.js";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { useNavigate, useSearchParams } from "react-router";

dayjs.extend(utc);
dayjs.extend(customParseFormat);

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartDataLabels,
);

const options: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0,
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
  plugins: {
    datalabels: {
      formatter: (value: number) => (value !== 0 ? value : ""),
    },
  },
  onHover: function (event, elements) {
    (event.native!.target as HTMLElement).style.cursor = elements[0]
      ? "pointer"
      : "default";
  },
};

interface Props {
  chapterId: string;
  data: ChartData<"bar", (number | [number, number] | null)[], unknown>;
}

export function MissingReportsBarChart({ chapterId, data }: Props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  options.onClick = (event, elements, chart) => {
    if (elements.length > 0 && chart.data.labels) {
      const sessionDate = chart.data.labels[elements[0].index] as string;

      const selectedTermDate = dayjs.utc(sessionDate, "DD/MM/YYYY").toDate();

      searchParams.set("chapterId", chapterId);
      searchParams.set("selectedTermDate", selectedTermDate.toISOString());
      searchParams.set("filterReports", "OUTSTANDING");

      void navigate(`/admin/student-sessions?${searchParams.toString()}`);
    }
  };

  return <Bar options={options} data={data} />;
}
