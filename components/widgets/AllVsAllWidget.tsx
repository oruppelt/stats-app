import { useQuery } from '@tanstack/react-query'
import { HeatMap } from './HeatMap'

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
  metadata?: {
    maxWinRate: number;
    minWinRate: number;
  };
}

interface AllVsAllWidgetProps {
  selectedTeam: string;
}

export function AllVsAllWidget({ selectedTeam }: AllVsAllWidgetProps) {
  const { data, isLoading, error } = useQuery<StrengthData>({
    queryKey: ['strength'],
    queryFn: () => fetch('/api/strength').then(res => res.json())
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading data</div>
  if (!data?.matrix) return null

  // Calculate max and min win rates if metadata is not provided
  const maxWinRate = data.metadata?.maxWinRate ?? 1
  const minWinRate = data.metadata?.minWinRate ?? 0

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4">Team Win Rates</h2>
      
      <div className="overflow-auto">
        <HeatMap
          teams={data.teams}
          matrix={data.matrix}
          matrix_wins={data.matrix_wins}
          maxValue={maxWinRate}
          minValue={minWinRate}
          selectedTeam={selectedTeam}
        />
      </div>
    </div>
  )
}

