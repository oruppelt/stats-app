import { useQuery } from '@tanstack/react-query';

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

// Add tooltip component
const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block">
    <span className="cursor-help">ⓘ</span>
    <div className="invisible group-hover:visible absolute z-10 w-64 p-2 bg-black text-white text-sm rounded-lg">
      {text}
    </div>
  </div>
);

export function ScheduleLuckWidget({ selectedTeam }: ScheduleLuckWidgetProps) {
  const { data, isLoading, error } = useQuery<StrengthData>({
    queryKey: ['schedule_strength'],
    queryFn: () => fetch('/api/schedule_strength').then(res => res.json())
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!data?.matrix) return null;

  const rankingsData = [...data.matrix].sort((a, b) => a.Rank - b.Rank);
  
  const maxStrength = Math.max(...rankingsData.map(team => team.Strength));
  const minStrength = Math.min(...rankingsData.map(team => team.Strength));
  const absMaxStrength = Math.max(Math.abs(maxStrength), Math.abs(minStrength));

  const getBarStyles = (strength: number) => {
    const percentage = (Math.abs(strength) / absMaxStrength) * 100;
    return {
      width: `${percentage}%`,
      marginLeft: strength < 0 ? 'auto' : undefined
    };
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-center mb-6">
        <h2 className="text-2xl font-bold">Schedule Luck Rankings</h2>
        <Tooltip text="Positive values indicate an easier schedule, negative values indicate a harder schedule" />
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
          <div className="px-6 py-3">Rank</div>
          <div className="px-6 py-3 col-span-2">Team</div>
          <div className="px-6 py-3 whitespace-nowrap">
            Schedule Luck 
          </div>
        </div>
        
        {/* Rankings List */}
        <div className="divide-y divide-gray-200">
          {rankingsData.map((team) => {
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
                  #{team.Rank}
                </div>
                <div className={`px-6 py-4 font-medium col-span-2 ${isSelected ? 'text-blue-700' : ''}`}>
                  {team['Team1 ']}
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center">
                    <span className={`text-gray-700 w-16 ${isSelected ? 'text-blue-700' : ''}`}>
                      {team.Strength.toFixed(3)}
                    </span>
                    <div className="ml-3 flex-grow max-w-[100px] relative">
                      <div className="absolute h-full w-[1px] bg-gray-400 left-1/2 top-0" />
                      <div className="h-2 rounded-full bg-gray-200">
                        <div 
                          className={`h-2 rounded-full ${
                            isSelected
                              ? team.Strength >= 0 ? 'bg-blue-500' : 'bg-blue-600'
                              : team.Strength >= 0 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={getBarStyles(team.Strength)}
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