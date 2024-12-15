/* eslint-disable @typescript-eslint/no-unused-vars */
import { Scatter } from 'react-chartjs-2'
import { useQuery } from '@tanstack/react-query'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ScatterDataPoint,
  ChartOptions,
  TooltipModel,
  TooltipItem
} from 'chart.js'

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

// Define the data structure from the API
interface TeamScore {
  Team: string;
  'Scored For': number;
  'Scored Against': number;
}

interface PointsData {
  df_scores: TeamScore[];
}

// Define custom types for the chart
interface CustomDataPoint extends ScatterDataPoint {
  team?: string;
}

type DatasetType = {
  label: string;
  data: CustomDataPoint[];
  pointStyle?: (HTMLImageElement | string)[];
  pointRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  borderDash?: number[];
  showLine?: boolean;
  type?: 'line';
}

interface CustomChartData {
  datasets: DatasetType[];
}

// Define tooltip context type
interface TooltipContext {
  raw: {
    team?: string;
    x: number;
    y: number;
  };
}

export function PointsWidget() {
  const { data, isLoading, error } = useQuery<PointsData>({
    queryKey: ['points'],
    queryFn: () => fetch('/api/for_against').then(res => res.json())
  })

  const calculateMedian = (arr: number[]): number => {
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  }

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  )

  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-red-500 bg-red-50 p-4 rounded-lg shadow">
        Error loading data: {String(error)}
      </div>
    </div>
  )

  if (!data?.df_scores) return <div className="flex justify-center items-center h-screen">No data available</div>

  const scores = data.df_scores
  const medianScoredFor = calculateMedian(scores.map(d => d['Scored For']))
  const medianScoredAgainst = calculateMedian(scores.map(d => d['Scored Against']))

  const chartData: CustomChartData = {
    datasets: [
      {
        label: 'Teams',
        data: scores.map(team => ({
          x: team['Scored For'],
          y: team['Scored Against'],
          team: team.Team
        })),
        pointStyle: scores.map(team => {
          const img = new Image(40, 40);
          img.src = `/logos/${team.Team.trim()}.png`;
          return img;
        }),
        pointRadius: 20,
      },
      {
        type: 'line',
        label: 'Median Points For',
        data: [
          { x: medianScoredFor, y: Math.min(...scores.map(d => d['Scored Against'])) * 0.9 },
          { x: medianScoredFor, y: Math.max(...scores.map(d => d['Scored Against'])) * 1.1 }
        ],
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        showLine: true,
      },
      {
        type: 'line',
        label: 'Median Points Against',
        data: [
          { x: Math.min(...scores.map(d => d['Scored For'])) * 0.9, y: medianScoredAgainst },
          { x: Math.max(...scores.map(d => d['Scored For'])) * 1.1, y: medianScoredAgainst }
        ],
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        showLine: true,
      }
    ]
  }

  // Calculate bounds for each axis
  const minX = Math.min(...scores.map(d => d['Scored For'])) * 0.9
  const maxX = Math.max(...scores.map(d => d['Scored For'])) * 1.1
  const minY = Math.min(...scores.map(d => d['Scored Against'])) * 0.9
  const maxY = Math.max(...scores.map(d => d['Scored Against'])) * 1.1

  const options: ChartOptions<'scatter'> = {
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Points For',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        min: minX,
        max: maxX,
        grid: {
          display: true,
          drawTicks: true,
        },
        ticks: {
          stepSize: 50
        }
      },
      y: {
        title: {
          display: true,
          text: 'Points Against',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        min: minY,
        max: maxY,
        grid: {
          display: true,
          drawTicks: true,
        },
        ticks: {
          stepSize: 50
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        position: 'nearest',
        callbacks: {
          label: function(this: TooltipModel<'scatter'>, context: TooltipItem<'scatter'>): string {
            const dataPoint = context.raw as CustomDataPoint;
            if (dataPoint.team) {
              return `${dataPoint.team} (For: ${dataPoint.x}, Against: ${dataPoint.y})`;
            }
            return '';
          }
        },
        z: 100
      },
      title: {
        display: true,
        text: 'Points For and Against',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-[1200px] h-[800px]">
        <Scatter data={chartData} options={options} />
      </div>
    </div>
  )
}

