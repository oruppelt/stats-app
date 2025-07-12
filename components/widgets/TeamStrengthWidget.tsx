import { useQuery } from '@tanstack/react-query'
import { useLogger } from '@/lib/logger'
import { useEffect } from 'react'
import { ModernRankingCard } from './ModernRankingCard'

interface StrengthData {
  matrix: {
    'Team1 ': string;
    Strength: number;
    Rank: number;
    [key: string]: number | string;
  }[];
}

interface TeamStrengthWidgetProps {
  selectedTeam: string;
}

export function TeamStrengthWidget({ selectedTeam }: TeamStrengthWidgetProps) {
  const logger = useLogger('TeamStrengthWidget');
  
  useEffect(() => {
    logger.info('TeamStrengthWidget mounted', { selectedTeam });
    return () => logger.info('TeamStrengthWidget unmounted');
  }, [logger, selectedTeam]);

  const { data, isLoading, error } = useQuery<StrengthData>({
    queryKey: ['strength'],
    queryFn: async () => {
      logger.info('Fetching team strength data');
      const response = await fetch('/api/strength');
      if (!response.ok) {
        const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        logger.error('Failed to fetch team strength data', { status: response.status, statusText: response.statusText });
        throw new Error(errorMsg);
      }
      const data = await response.json();
      logger.info('Team strength data received', { 
        teamsCount: data?.matrix?.length 
      });
      return data;
    }
  });

  if (isLoading) {
    logger.info('Loading team strength data');
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    logger.error('Error loading team strength data', undefined, error as Error);
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500 bg-red-50 p-4 rounded-lg shadow">
          Error loading team strength data: {String(error)}
        </div>
      </div>
    );
  }

  if (!data?.matrix) {
    logger.warn('No team strength matrix data available');
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">No team strength data available</div>
      </div>
    );
  }

  const rankingsData = [...data.matrix].sort((a, b) => a.Rank - b.Rank);

  const getStrengthCategory = (strength: number) => {
    if (strength >= 0.7) return { label: 'Elite', color: 'bg-green-500', textColor: 'text-green-700' };
    if (strength >= 0.6) return { label: 'Strong', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (strength >= 0.5) return { label: 'Average', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (strength >= 0.4) return { label: 'Below Average', color: 'bg-orange-500', textColor: 'text-orange-700' };
    return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const getPercentile = (rank: number, total: number) => {
    const percentile = Math.round(((total - rank + 1) / total) * 100);
    return percentile;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Team Strength Rankings</h2>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-800">{rankingsData.length}</div>
          <div className="text-sm text-gray-600">Total Teams</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">
            {rankingsData.filter(t => t.Strength >= 0.6).length}
          </div>
          <div className="text-sm text-gray-600">Strong+ Teams</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {rankingsData[0]?.Strength.toFixed(3) || 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Best Strength</div>
        </div>
      </div>

      {/* Rankings Cards */}
      <div className="space-y-3">
        {rankingsData.map((team) => {
          const isSelected = team['Team1 '] === selectedTeam;
          const category = getStrengthCategory(team.Strength);
          const percentile = getPercentile(team.Rank, rankingsData.length);
          
          return (
            <ModernRankingCard
              key={team['Team1 ']}
              rank={team.Rank}
              teamName={team['Team1 ']}
              value={team.Strength}
              label="Win Rate Strength"
              isSelected={isSelected}
              onClick={() => {
                logger.userAction('team_strength_card_clicked', {
                  team: team['Team1 '],
                  rank: team.Rank,
                  strength: team.Strength,
                  selectedTeam
                });
              }}
            >
              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <div className="flex-grow">
                  <div className="h-3 rounded-full bg-gray-200">
                    <div 
                      className={`h-3 rounded-full ${category.color} transition-all duration-300`}
                      style={{ width: `${team.Strength * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600 min-w-0">
                  {(team.Strength * 100).toFixed(1)}%
                </div>
              </div>
              
              {/* Category and Percentile */}
              <div className="flex items-center justify-between mt-2">
                <span className={`text-sm font-medium px-2 py-1 rounded ${category.textColor} bg-opacity-10`}>
                  {category.label}
                </span>
                <span className="text-sm text-gray-500">
                  Top {percentile}%
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
            📊 Viewing: {selectedTeam}
          </h3>
          <p className="text-sm text-blue-700">
            {selectedTeam} is highlighted above. Win Rate Strength represents the team&apos;s overall performance quality.
          </p>
        </div>
      )}
    </div>
  );
} 