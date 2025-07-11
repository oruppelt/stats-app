import { Scatter } from 'react-chartjs-2'
import { useQuery } from '@tanstack/react-query'
import { useLogger } from '@/lib/logger'
import { useEffect } from 'react'
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
  TooltipItem,
  ChartData
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

interface PointsWidgetProps {
  selectedTeam?: string;
}

// Define custom types for the chart
interface CustomDataPoint extends ScatterDataPoint {
  team?: string;
}

// Create a specific type for the scatter dataset
type ScatterChartData = ChartData<'scatter', CustomDataPoint[], unknown>;

export function PointsWidget({ selectedTeam }: PointsWidgetProps = {}) {
  const logger = useLogger('PointsWidget');
  useEffect(() => {
    logger.info('PointsWidget mounted', { selectedTeam });
    return () => logger.info('PointsWidget unmounted');
  }, [logger, selectedTeam]);

  const { data, isLoading, error } = useQuery<PointsData>({
    queryKey: ['points'],
    queryFn: async () => {
      logger.info('Fetching points data');
      const response = await fetch('/api/for_against');
      if (!response.ok) {
        const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        logger.error('Failed to fetch points data', { status: response.status, statusText: response.statusText });
        throw new Error(errorMsg);
      }
      const data = await response.json();
      logger.info('Points data received', { 
        teamsCount: data?.df_scores?.length 
      });
      return data;
    }
  })

  const calculateMedian = (arr: number[]): number => {
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  }

  const getQuadrant = (pointsFor: number, pointsAgainst: number, avgFor: number, avgAgainst: number) => {
    if (pointsFor >= avgFor && pointsAgainst <= avgAgainst) return 'excellent'; // High scoring, low points against
    if (pointsFor >= avgFor && pointsAgainst > avgAgainst) return 'volatile';   // High scoring, high points against
    if (pointsFor < avgFor && pointsAgainst <= avgAgainst) return 'defensive';  // Low scoring, low points against
    if (pointsFor < avgFor && pointsAgainst > avgAgainst) return 'concerning';  // Low scoring, high points against
    return 'unknown';
  };

  const getQuadrantColor = (quadrant: string) => {
    const colors = {
      excellent: '#10b981',  // Green
      volatile: '#f59e0b',   // Yellow
      defensive: '#3b82f6',  // Blue  
      concerning: '#ef4444', // Red
      unknown: '#6b7280'     // Gray
    };
    return colors[quadrant as keyof typeof colors] || colors.unknown;
  };

  if (isLoading) {
    logger.info('Loading points data');
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    logger.error('Error loading points data', undefined, error as Error);
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500 bg-red-50 p-4 rounded-lg shadow">
          Error loading points data: {String(error)}
        </div>
      </div>
    );
  }

  if (!data?.df_scores) {
    logger.warn('No points data available');
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">No points data available</div>
      </div>
    );
  }

  const scores = data.df_scores
  const medianScoredFor = calculateMedian(scores.map(d => d['Scored For']))
  const medianScoredAgainst = calculateMedian(scores.map(d => d['Scored Against']))

  // Calculate averages for quadrant analysis
  const avgScoredFor = scores.reduce((sum, d) => sum + d['Scored For'], 0) / scores.length
  const avgScoredAgainst = scores.reduce((sum, d) => sum + d['Scored Against'], 0) / scores.length

  const chartData: ScatterChartData = {
    datasets: [
      {
        type: 'scatter',
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
        pointRadius: selectedTeam ? scores.map(team => team.Team === selectedTeam ? 25 : 20) : 20,
        pointBorderColor: scores.map(team => {
          const quadrant = getQuadrant(team['Scored For'], team['Scored Against'], avgScoredFor, avgScoredAgainst);
          return getQuadrantColor(quadrant);
        }),
        pointBorderWidth: selectedTeam ? scores.map(team => team.Team === selectedTeam ? 4 : 2) : 2,
      },
      {
        type: 'scatter',
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
        type: 'scatter',
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
              const quadrant = getQuadrant(dataPoint.x as number, dataPoint.y as number, avgScoredFor, avgScoredAgainst);
              const quadrantLabels = {
                excellent: '🟢 Excellent',
                volatile: '🟡 Volatile',
                defensive: '🟡 Defensive',
                concerning: '🔴 Concerning',
                unknown: '⚪ Unknown'
              };
              const quadrantLabel = quadrantLabels[quadrant as keyof typeof quadrantLabels] || quadrantLabels.unknown;
              return `${dataPoint.team} | For: ${dataPoint.x} | Against: ${dataPoint.y} | ${quadrantLabel}`;
            }
            return '';
          }
        }
      },
      title: {
        display: true,
        text: 'Points For vs Points Against Analysis',
        font: {
          size: 18,
          weight: 'bold'
        }
      }
    }
  }

  return (
    <div className="w-full">
      {/* Chart */}
      <div className="w-full h-[600px] bg-white rounded-lg border border-gray-200 p-4">
        <Scatter data={chartData} options={options} />
      </div>
      
      {/* Selected team info panel */}
      {selectedTeam && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">
            📊 Viewing: {selectedTeam}
          </h3>
          <p className="text-sm text-blue-700">
            {selectedTeam} is highlighted with a larger logo and colored border. Hover over any team to see detailed performance analysis.
          </p>
        </div>
      )}
    </div>
  );
}

