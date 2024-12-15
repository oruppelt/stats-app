/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from '@tanstack/react-query';

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
  const { data, isLoading, error } = useQuery<StrengthData>({
    queryKey: ['strength'],
    queryFn: () => fetch('/api/strength').then(res => res.json())
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!data?.matrix) return null;

  const rankingsData = [...data.matrix].sort((a, b) => a.Rank - b.Rank);

  const getStrengthColor = (strength: number) => {
    if (strength > 0.6) return 'bg-green-500';
    if (strength > 0.4) return 'bg-blue-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Team Strength Rankings</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
          <div className="px-6 py-3">Rank</div>
          <div className="px-6 py-3 col-span-2">Team</div>
          <div className="px-6 py-3 whitespace-nowrap">WinRate Strength</div>
        </div>
        
        {/* Rankings List */}
        <div className="divide-y divide-gray-200">
          {rankingsData.map((team, index) => {
            const isSelected = team['Team1 '] === selectedTeam;
            return (
              <div 
                key={team['Team1 ']} 
                className={`grid grid-cols-4 transition-colors ${
                  isSelected 
                    ? 'bg-blue-50 hover:bg-blue-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`px-6 py-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                  #{index + 1}
                </div>
                <div className={`px-6 py-4 font-medium col-span-2 ${isSelected ? 'text-blue-700' : ''}`}>
                  {team['Team1 ']}
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center">
                    <span className={`${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                      {team.Strength.toFixed(3)}
                    </span>
                    <div className="ml-3 flex-grow max-w-[100px]">
                      <div className="h-2 rounded-full bg-gray-200">
                        <div 
                          className={`h-2 rounded-full ${getStrengthColor(team.Strength)}`}
                          style={{ width: `${team.Strength * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 