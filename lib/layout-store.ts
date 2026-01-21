/**
 * Layout Store - Zustand state management for dashboard layout
 *
 * Manages:
 * - Sidebar open/collapsed state
 * - View mode (tabs vs grid)
 * - Widget visibility toggles
 * - Last updated timestamps for cache indicators
 *
 * State persists to localStorage via Zustand persist middleware
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutState {
  // Sidebar state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // Last updated timestamps (for tab badges)
  lastUpdated: Record<string, number>
  setLastUpdated: (widgetId: string, timestamp: number) => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      // Sidebar starts open on desktop
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Last updated timestamps initially empty
      lastUpdated: {},
      setLastUpdated: (widgetId, timestamp) =>
        set((state) => ({
          lastUpdated: { ...state.lastUpdated, [widgetId]: timestamp },
        })),
    }),
    {
      name: 'nba-dashboard-layout', // localStorage key
    }
  )
)
