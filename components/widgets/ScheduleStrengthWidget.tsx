import { useQuery } from '@tanstack/react-query'
import { StrengthHeatMap } from './StrengthHeatMap'

interface StrengthData {
  teams: string[];
  matrix: {
    'Team1 ': string;
    Strength: number;
    Rank: number;
    [key: string]: number | string;
  }[];
  matrix_wins: {
    'Team1 ': string;
    [key: string]: number | string;
  }[];
}

interface ScheduleStrengthWidgetProps {
  selectedTeam: string;
}

export function ScheduleStrengthWidget({ selectedTeam }: ScheduleStrengthWidgetProps) {
  const { data, isLoading, error } = useQuery<StrengthData>({
    queryKey: ['schedule_strength'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/schedule_strength')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    }
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading data: {String(error)}</div>
  if (!data?.matrix) return <div>No matrix data available</div>

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4">Schedule Strength Analysis</h2>
      
      <div className="overflow-auto">
        <StrengthHeatMap
          teams={data.teams}
          matrix={data.matrix}
          maxValue={1}
          minValue={-1}
          selectedTeam={selectedTeam}
        />
      </div>
    </div>
  )
}

