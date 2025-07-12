import { useQuery } from '@tanstack/react-query'
import { useLogger } from '@/lib/logger'
import { useEffect } from 'react'
import { ModernRankingCard } from './ModernRankingCard'
import { BidirectionalBar } from './BidirectionalBar'

interface StrengthData {
  matrix: {
    'Team1 ': string;
    Strength: number;
    Rank: number;
    [key: string]: number | string;
  }[];
}

interface ScheduleLuckWidgetProps {
  selectedTeam: string;
}

export function ScheduleLuckWidget({ selectedTeam }: ScheduleLuckWidgetProps) {
  const logger = useLogger('ScheduleLuckWidget');
  
  useEffect(() => {
    logger.info('ScheduleLuckWidget mounted', { selectedTeam });
    return () => logger.info('ScheduleLuckWidget unmounted');
  }, [logger, selectedTeam]);

  const { data, isLoading, error } = useQuery<StrengthData>({
    queryKey: ['schedule_strength'],
    queryFn: async () => {
      logger.info('Fetching schedule luck data');
      const response = await fetch('/api/schedule_strength');
      if (!response.ok) {
        const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        logger.error('Failed to fetch schedule luck data', { status: response.status, statusText: response.statusText });
        throw new Error(errorMsg);
      }
      const data = await response.json();
      logger.info('Schedule luck data received', { 
        teamsCount: data?.matrix?.length 
      });
      return data;
    }
  });

  if (isLoading) {
    logger.info('Loading schedule luck data');
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    logger.error('Error loading schedule luck data', undefined, error as Error);
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500 bg-red-50 p-4 rounded-lg shadow">
          Error loading schedule luck data: {String(error)}
        </div>
      </div>
    );
  }

  if (!data?.matrix) {
    logger.warn('No schedule luck matrix data available');
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">No schedule luck data available</div>
      </div>
    );
  }

  const rankingsData = [...data.matrix].sort((a, b) => a.Rank - b.Rank);
  
  const maxStrength = Math.max(...rankingsData.map(team => team.Strength));
  const minStrength = Math.min(...rankingsData.map(team => team.Strength));

  const getLuckCategory = (strength: number) => {
    if (strength <= -1.0) return { label: 'Very Unlucky', color: 'bg-red-500', textColor: 'text-red-700' };
    if (strength <= -0.5) return { label: 'Unlucky', color: 'bg-red-400', textColor: 'text-red-600' };
    if (strength < 0.5 && strength > -0.5) return { label: 'Average Luck', color: 'bg-gray-400', textColor: 'text-gray-700' };
    if (strength <= 1.0) return { label: 'Lucky', color: 'bg-green-400', textColor: 'text-green-600' };
    return { label: 'Very Lucky', color: 'bg-green-500', textColor: 'text-green-700' };
  };

  const getPercentile = (rank: number, total: number) => {
    const percentile = Math.round(((total - rank + 1) / total) * 100);
    return percentile;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Schedule Luck Rankings</h2>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-800">{rankingsData.length}</div>
          <div className="text-sm text-gray-600">Total Teams</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">
            {rankingsData.filter(t => t.Strength >= 0.5).length}
          </div>
          <div className="text-sm text-gray-600">Lucky+ Teams</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {rankingsData[rankingsData.length - 1]?.Strength.toFixed(3) || 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Best Luck</div>
        </div>
      </div>

      {/* Rankings Cards */}
      <div className="space-y-3">
        {rankingsData.map((team) => {
          const isSelected = team['Team1 '] === selectedTeam;
          const category = getLuckCategory(team.Strength);
          const percentile = getPercentile(team.Rank, rankingsData.length);
          
          return (
            <ModernRankingCard
              key={team['Team1 ']}
              rank={team.Rank}
              teamName={team['Team1 ']}
              value={team.Strength}
              label="Schedule Luck"
              isSelected={isSelected}
              onClick={() => {
                logger.userAction('schedule_luck_card_clicked', {
                  team: team['Team1 '],
                  rank: team.Rank,
                  luck: team.Strength,
                  selectedTeam
                });
              }}
            >
              {/* Bidirectional Bar */}
              <BidirectionalBar
                value={team.Strength}
                minValue={minStrength}
                maxValue={maxStrength}
                height={16}
                className="mt-2"
              />
              
              {/* Category and Percentile */}
              <div className="flex items-center justify-between mt-2">
                <span className={`text-sm font-medium px-2 py-1 rounded ${category.textColor} bg-opacity-10`}>
                  {category.label}
                </span>
                <span className="text-sm text-gray-500">
                  {team.Strength >= 0 ? `Top ${100 - percentile + 1}% Lucky` : `Top ${percentile}% Unlucky`}
                </span>
              </div>
            </ModernRankingCard>
          );
        })}
      </div>

      {/* Selected team info */}
      {selectedTeam && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">
            🍀 Viewing: {selectedTeam}
          </h3>
          <p className="text-sm text-blue-700">
            {selectedTeam} is highlighted above. Schedule Luck shows how favorable their opponents&apos; strength has been.
            Positive values = easier opponents (lucky), negative values = harder opponents (unlucky).
          </p>
        </div>
      )}
    </div>
  );
} 