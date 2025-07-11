"use client"

import { useState, useEffect } from "react"
import { PointsWidget } from "./widgets/PointsWidget"
import { AllVsAllWidget } from "./widgets/AllVsAllWidget"
import { ScheduleStrengthWidget } from "./widgets/ScheduleStrengthWidget"
import { TeamStrengthWidget } from "./widgets/TeamStrengthWidget"
import { ScheduleLuckWidget } from "./widgets/ScheduleLuckWidget"
import { useQuery } from '@tanstack/react-query'
import { useLogger } from '@/lib/logger'
import { handleQueryError, handleQuerySuccess, statsApi } from '@/lib/api-client'

interface TeamsData {
  teams: string[];
  // ... other fields
}

export function Dashboard() {
  const logger = useLogger('Dashboard');
  const [activeWidget, setActiveWidget] = useState<string>("points")
  const [selectedTeam, setSelectedTeam] = useState<string>("")

  useEffect(() => {
    logger.info('Dashboard mounted');
    return () => logger.info('Dashboard unmounted');
  }, [logger]);

  const handleWidgetChange = (newWidget: string) => {
    logger.userAction('widget_changed', { 
      previousWidget: activeWidget,
      newWidget
    });
    setActiveWidget(newWidget);
  };

  // Fetch teams list from any of the endpoints that provide it
  const { data } = useQuery<TeamsData>({
    queryKey: ['strength'],
    queryFn: async () => {
      try {
        logger.info('Fetching teams data for dashboard');
        const response = await statsApi.getStrength();
        handleQuerySuccess(response.data, 'strength');
        return response.data as TeamsData;
      } catch (err) {
        logger.error('Failed to fetch teams data', undefined, err as Error);
        handleQueryError(err, 'strength');
        throw err;
      }
    }
  })

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col items-center space-y-4">
        {/* Team Filter Dropdown */}
        {data?.teams && (
          <div className="mb-2">
            <select
              value={selectedTeam}
              onChange={(e) => {
                const newTeam = e.target.value;
                logger.userAction('team_selection_changed', { 
                  previousTeam: selectedTeam,
                  newTeam,
                  availableTeams: data?.teams?.length
                });
                setSelectedTeam(newTeam);
              }}
              className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Teams</option>
              {data.teams.map(team => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Widget Selection Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            className={`rounded px-6 py-3 font-medium transition-colors ${
              activeWidget === "points" ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => handleWidgetChange("points")}
          >
            Points For/Against
          </button>
          <button
            className={`rounded px-6 py-3 font-medium transition-colors ${
              activeWidget === "allvsall" ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => handleWidgetChange("allvsall")}
          >
            All vs All
          </button>
          <button
            className={`rounded px-6 py-3 font-medium transition-colors ${
              activeWidget === "teamstrength" ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => handleWidgetChange("teamstrength")}
          >
            Team Strength
          </button>
          <button
            className={`rounded px-6 py-3 font-medium transition-colors ${
              activeWidget === "schedule" ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => handleWidgetChange("schedule")}
          >
            Schedule Strength
          </button>
          <button
            className={`rounded px-6 py-3 font-medium transition-colors ${
              activeWidget === "scheduleluck" ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => handleWidgetChange("scheduleluck")}
          >
            Schedule Luck
          </button>
        </div>
      </div>

      <div>
        {activeWidget === "points" && <PointsWidget />}
        {activeWidget === "allvsall" && <AllVsAllWidget selectedTeam={selectedTeam} />}
        {activeWidget === "teamstrength" && <TeamStrengthWidget selectedTeam={selectedTeam} />}
        {activeWidget === "schedule" && <ScheduleStrengthWidget selectedTeam={selectedTeam} />}
        {activeWidget === "scheduleluck" && <ScheduleLuckWidget selectedTeam={selectedTeam} />}
      </div>
    </div>
  )
}

