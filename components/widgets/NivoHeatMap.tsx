/* eslint-disable @typescript-eslint/no-unused-vars */
import { ResponsiveHeatMap } from '@nivo/heatmap'
import { useLogger } from '@/lib/logger'
import { useEffect, useMemo } from 'react'

interface NivoHeatMapProps {
  teams: string[];
  matrix: Array<{
    'Team1 ': string;
    [key: string]: number | string;
  }>;
  matrix_wins?: Array<{
    'Team1 ': string;
    [key: string]: number | string;
  }>;
  maxValue: number;
  minValue: number;
  selectedTeam?: string;
}

interface HeatMapData {
  id: string;
  data: Array<{
    x: string;
    y: number | null;
    winCount?: number | null;
    isNoData?: boolean;
  }>;
}

export function NivoHeatMap({ 
  teams, 
  matrix, 
  matrix_wins, 
  maxValue, 
  minValue, 
  selectedTeam 
}: NivoHeatMapProps) {
  const logger = useLogger('NivoHeatMap');

  // Transform data for Nivo format
  const heatmapData: HeatMapData[] = useMemo(() => {
    logger.dataTransform('transforming_matrix_to_nivo_format', matrix.length, teams.length);
    
    return matrix.map((row, rowIndex) => {
      const teamName = row['Team1 '].trim();
      
      const rowData = teams.map(team => {
        const value = row[team] as number;
        const winValue = matrix_wins?.[rowIndex]?.[team] as number ?? -1;
        
        return {
          x: team.trim(),
          y: value === -1 ? null : value, // Nivo handles null values gracefully
          winCount: winValue === -1 ? null : winValue,
          isNoData: value === -1
        };
      });

      return {
        id: teamName,
        data: rowData
      };
    });
  }, [matrix, matrix_wins, teams, logger]);

  useEffect(() => {
    logger.chartRender('nivo_heatmap', matrix.length * teams.length);
  }, [matrix, teams, logger]);


  // Color scheme for win rates (0-1 scale)
  const colorScheme = ['#dc2626', '#ea580c', '#eab308', '#65a30d', '#16a34a'];

  return (
    <div className="w-full h-[600px]">
      <ResponsiveHeatMap
        data={heatmapData}
        margin={{ top: 120, right: 90, bottom: 60, left: 160 }}
        colors={{
          type: 'quantize',
          colors: [
            '#f0f9ff', // Very light blue (0-20%)
            '#bfdbfe', // Light blue (20-40%) 
            '#60a5fa', // Medium blue (40-60%)
            '#3b82f6', // Blue (60-80%)
            '#1d4ed8'  // Dark blue (80-100%)
          ]
        }}
        labelTextColor="#000000"
        borderColor="#ffffff"
        borderWidth={1}
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -90,
          legend: '',
          legendOffset: 36
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '',
          legendOffset: -40
        }}
        animate={true}
        onClick={(cell) => {
          logger.userAction('heatmap_cell_clicked', {
            cellData: cell,
            selectedTeam
          });
        }}
      />
      
      {/* Additional info panel */}
      {selectedTeam && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">
            📊 Viewing: {selectedTeam}
          </h3>
          <p className="text-sm text-blue-700">
            Click on cells to see detailed matchup information for {selectedTeam}.
          </p>
        </div>
      )}
    </div>
  );
}