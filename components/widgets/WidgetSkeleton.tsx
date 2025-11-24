import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface WidgetSkeletonProps {
  variant?: 'chart' | 'heatmap' | 'list' | 'scatter'
}

export function WidgetSkeleton({ variant = 'chart' }: WidgetSkeletonProps) {
  if (variant === 'chart') {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-around items-end h-[400px]">
            {[...Array(8)].map((_, i) => (
              <Skeleton
                key={i}
                className="w-12"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'heatmap') {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-10 gap-2">
            {[...Array(100)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'list') {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'scatter') {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[600px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return null
}
