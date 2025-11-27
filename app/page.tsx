import { Dashboard } from "@/components/Dashboard"
import { Header } from "@/components/layout/Header"

// Force dynamic rendering to prevent build-time data fetching
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <Dashboard />
      </main>
    </>
  )
}

