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

  // Get win rate category for interpretation
  const getWinRateCategory = (value: number | null) => {
    if (value === null) return { label: 'No Data', emoji: '⚪', desc: 'No matchup data available' };
    if (value >= 0.8) return { label: 'Dominant', emoji: '🟢', desc: 'Very strong matchup' };
    if (value >= 0.6) return { label: 'Favorable', emoji: '🟢', desc: 'Good win rate' };
    if (value >= 0.4) return { label: 'Competitive', emoji: '🟡', desc: 'Close matchup' };
    if (value >= 0.2) return { label: 'Unfavorable', emoji: '🔴', desc: 'Losing matchup' };
    return { label: 'Difficult', emoji: '🔴', desc: 'Very tough matchup' };
  };

  return (
    <div className="w-full h-[650px]">
      <ResponsiveHeatMap
        data={heatmapData}
        margin={{ top: 120, right: 90, bottom: 80, left: 160 }}
        colors={{
          type: 'quantize',
          colors: [
            '#fef2f2', // Very light red (0-20%)
            '#fecaca', // Light red (20-40%)
            '#fde047', // Yellow (40-60%)
            '#86efac', // Light green (60-80%)
            '#22c55e'  // Green (80-100%)
          ]
        }}
        emptyColor="#f3f4f6"
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
        motionConfig="gentle"
        isInteractive={true}
        onClick={(cell) => {
          logger.userAction('heatmap_cell_clicked', {
            cellData: cell,
            selectedTeam
          });
        }}
        tooltip={({ cell }) => {
          const team1 = cell.serieId;
          const team2 = cell.data.x;
          const winRate = cell.data.y as number | null;
          const winCount = (cell.data as { winCount?: number | null }).winCount;
          const category = getWinRateCategory(winRate);

          if (winRate === null) {
            return (
              <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                <div className="font-semibold text-card-foreground">{team1} vs {team2}</div>
                <div className="text-muted-foreground text-sm">No matchup data</div>
              </div>
            );
          }

          return (
            <div className="bg-card border border-border p-4 rounded-lg shadow-lg max-w-xs">
              <div className="font-bold text-lg mb-2 text-card-foreground">
                {team1} vs {team2}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Win Rate:</span>
                  <span className="font-semibold text-primary">{(winRate * 100).toFixed(1)}%</span>
                </div>
                {winCount !== null && winCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Record:</span>
                    <span className="font-semibold">{winCount}-{100 - winCount}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3 p-2 bg-muted rounded">
                  <span className="text-lg">{category.emoji}</span>
                  <div>
                    <div className="font-semibold text-xs">{category.label}</div>
                    <div className="text-xs text-muted-foreground">{category.desc}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
        legends={[
          {
            anchor: 'bottom',
            translateX: 0,
            translateY: 50,
            length: 400,
            thickness: 8,
            direction: 'row',
            tickPosition: 'after',
            tickSize: 3,
            tickSpacing: 4,
            tickOverlap: false,
            tickFormat: (value) => `${((value as number) * 100).toFixed(0)}%`,
            title: 'Win Rate (Red = Low, Green = High)',
            titleAlign: 'start',
            titleOffset: 4
          }
        ]}
      />
    </div>
  );
}