"use client"

import { useState } from "react"
import { PointsWidget } from "./widgets/PointsWidget"
import { AllVsAllWidget } from "./widgets/AllVsAllWidget"
import { ScheduleStrengthWidget } from "./widgets/ScheduleStrengthWidget"
import { TeamStrengthWidget } from "./widgets/TeamStrengthWidget"
import { ScheduleLuckWidget } from "./widgets/ScheduleLuckWidget"
import { useQuery } from '@tanstack/react-query'

interface TeamsData {
  teams: string[];
  // ... other fields
}

export function Dashboard() {
  const [activeWidget, setActiveWidget] = useState<string>("points")
  const [selectedTeam, setSelectedTeam] = useState<string>("")

  // Fetch teams list from any of the endpoints that provide it
  const { data } = useQuery<TeamsData>({
    queryKey: ['strength'],
    queryFn: () => fetch('/api/strength').then(res => res.json())
  })

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col items-center space-y-4">
        {/* Team Filter Dropdown */}
        {data?.teams && (
          <div className="mb-2">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
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
            onClick={() => setActiveWidget("points")}
          >
            Points For/Against
          </button>
          <button
            className={`rounded px-6 py-3 font-medium transition-colors ${
              activeWidget === "allvsall" ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setActiveWidget("allvsall")}
          >
            All vs All
          </button>
          <button
            className={`rounded px-6 py-3 font-medium transition-colors ${
              activeWidget === "teamstrength" ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setActiveWidget("teamstrength")}
          >
            Team Strength
          </button>
          <button
            className={`rounded px-6 py-3 font-medium transition-colors ${
              activeWidget === "schedule" ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setActiveWidget("schedule")}
          >
            Schedule Strength
          </button>
          <button
            className={`rounded px-6 py-3 font-medium transition-colors ${
              activeWidget === "scheduleluck" ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setActiveWidget("scheduleluck")}
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

