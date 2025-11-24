import { Dashboard } from "@/components/Dashboard"
import { Header } from "@/components/layout/Header"

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

