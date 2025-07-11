import { useQuery } from '@tanstack/react-query'
import { NivoHeatMap } from './NivoHeatMap'
import { useLogger } from '@/lib/logger'
import { useEffect } from 'react'

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
  const logger = useLogger('AllVsAllWidget');
  
  useEffect(() => {
    logger.info('AllVsAllWidget mounted', { selectedTeam });
    return () => logger.info('AllVsAllWidget unmounted');
  }, [logger, selectedTeam]);

  const { data, isLoading, error } = useQuery<StrengthData>({
    queryKey: ['strength'],
    queryFn: async () => {
      logger.info('Fetching strength data for heatmap');
      const response = await fetch('/api/strength');
      if (!response.ok) {
        const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        logger.error('Failed to fetch strength data', { status: response.status, statusText: response.statusText });
        throw new Error(errorMsg);
      }
      const data = await response.json();
      logger.info('Strength data received', { 
        teamsCount: data?.teams?.length, 
        matrixCount: data?.matrix?.length 
      });
      return data;
    }
  })

  if (isLoading) {
    logger.info('Loading strength data for heatmap');
    return <div className="flex items-center justify-center p-8">
      <div className="text-gray-600">Loading heatmap data...</div>
    </div>;
  }
  
  if (error) {
    logger.error('Error loading strength data', undefined, error as Error);
    return <div className="flex items-center justify-center p-8">
      <div className="text-red-600">Error loading heatmap data</div>
    </div>;
  }
  
  if (!data?.matrix) {
    logger.warn('No matrix data available for heatmap');
    return <div className="flex items-center justify-center p-8">
      <div className="text-gray-600">No heatmap data available</div>
    </div>;
  }

  // Calculate max and min win rates if metadata is not provided
  const maxWinRate = data.metadata?.maxWinRate ?? 1
  const minWinRate = data.metadata?.minWinRate ?? 0

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4">Team Win Rates</h2>
      
      <div className="w-full">
        <NivoHeatMap
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

